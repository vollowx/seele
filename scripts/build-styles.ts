import { unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { transform } from 'lightningcss';
import chokidar from 'chokidar';

const projectroot = path.resolve(import.meta.dir, '..');
const srcdir = path.join(projectroot, 'src');

const args = Bun.argv.slice(2);
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
  csscontent: string,
  filepath: string,
  minify = false
): Promise<string> {
  let content = csscontent;

  if (minify) {
    const { code } = transform({
      filename: filepath,
      code: Buffer.from(csscontent),
      minify: true,
    });
    content = code.toString();
  }

  const escaped = content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const exportname = getExportName(filepath);

  return [
    "import { css } from 'lit';",
    `export const ${exportname} = css\`${minify ? escaped : `\n${escaped}\n`}\`;`,
    '',
  ].join('\n');
}

async function convertFile(cssPath: string, minify = false) {
  try {
    const css = await Bun.file(cssPath).text();
    const ts = await convertCSS(css, cssPath, minify);
    const outpath = `${cssPath}.ts`;

    await Bun.write(outpath, ts);
    console.log(`converted: ${path.basename(cssPath)}`);
  } catch (err: any) {
    console.error(`failed to convert ${path.basename(cssPath)}: ${err.message}`);
  }
}

async function run() {
  if (isWatch) {
    console.log(`watching CSS file changes...`);

    const watcher = chokidar.watch('.', {
      cwd: srcdir,
      ignoreInitial: false,
      usePolling: true,
      ignored: (path, stats) =>
        stats?.isFile() && !path.endsWith('-styles.css') ? true : false,
      // Oh my dear TypeScript
    });

    watcher
      .on('add', (file) => convertFile(path.join(srcdir, file), isMinify))
      .on('change', (file) => convertFile(path.join(srcdir, file), isMinify))
      .on('unlink', (file) => {
        const tspath = path.join(srcdir, `${file}.ts`);
        if (existsSync(tspath)) {
          unlinkSync(tspath);
          console.log(`deleted: ${path.basename(tspath)}`);
        }
      });
  } else {
    const glob = new Bun.Glob('**/*-styles.css');
    const files = Array.from(glob.scanSync(srcdir));

    if (files.length === 0) {
      console.log('no CSS file found');
      return;
    }

    console.log(
      `converting ${files.length} CSS files (minify: ${isMinify})...`
    );
    await Promise.all(
      files.map((f) => convertFile(path.join(srcdir, f), isMinify))
    );
    console.log('done');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
