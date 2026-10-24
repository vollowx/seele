import { existsSync, unlinkSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from 'lightningcss';
import chokidar from 'chokidar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workingDir = path.join(__dirname, '../src');

const args = process.argv.slice(2);
const isWatch = args.some((arg) => arg === '-w' || arg === '--watch');
const isMinify = args.some((arg) => arg === '-m' || arg === '--minify');

function getExportName(filepath: string): string {
  const filename = path.basename(filepath, '.css');
  return filename
    .split(/[-_]/)
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

async function convertCSS(
  cssCode: string,
  filePath: string,
  minify = false
): Promise<string> {
  const exportName = getExportName(filePath);
  let conveted = cssCode;

  if (minify) {
    const { code } = transform({
      filename: filePath,
      code: Buffer.from(cssCode),
      minify: true,
    });
    conveted = code.toString();
  }
  const escaped = conveted.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  return [
    "import { css } from 'lit';",
    `export const ${exportName} = css\`${minify ? escaped : `\n${escaped}`}\`;`,
    '',
  ].join('\n');
}

async function convertFile(cssPath: string, minify = false) {
  try {
    const raw = await readFile(cssPath, 'utf-8');
    const converted = await convertCSS(raw, cssPath, minify);
    const outPath = `${cssPath}.js`;
    await writeFile(outPath, converted, 'utf-8');
    console.log(`converted: ${path.basename(cssPath)}`);
  } catch (err: any) {
    console.error(
      `failed to convert ${path.basename(cssPath)}: ${err.message}`
    );
  }
}

async function run() {
  if (isWatch) {
    console.log(`watching CSS changes...`);

    const watcher = chokidar.watch('.', {
      cwd: workingDir,
      ignoreInitial: false,
      usePolling: true,
      ignored: (path, stats) =>
        stats?.isFile() && !path.endsWith('-styles.css') ? true : false,
    });

    watcher
      .on('add', (file) => convertFile(path.join(workingDir, file), isMinify))
      .on('change', (file) =>
        convertFile(path.join(workingDir, file), isMinify)
      )
      .on('unlink', (file) => {
        const generatedJsPath = path.join(workingDir, `${file}.js`);
        if (existsSync(generatedJsPath)) {
          unlinkSync(generatedJsPath);
          console.log(`deleted: ${path.basename(generatedJsPath)}`);
        }
      });
  } else {
    const allEntries = await readdir(workingDir, { recursive: true });
    const entries = allEntries.filter((f) => f.endsWith('-styles.css'));

    if (entries.length === 0) {
      console.warn('no CSS file found');
      return;
    }

    console.log(
      `converting ${entries.length} CSS files (minify: ${isMinify})...`
    );
    await Promise.all(
      entries.map((f) => convertFile(path.join(workingDir, f), isMinify))
    );
    console.log('done');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
