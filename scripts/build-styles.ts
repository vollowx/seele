import { unlinkSync } from 'node:fs';
import path from 'node:path';
import { transform } from 'lightningcss';
import { watch } from 'fs';

const projectroot = path.resolve(import.meta.dir, '..');
const srcdir = path.join(projectroot, 'src');

const args = Bun.argv.slice(2);
const iswatch = args.some((arg) => arg === '-w' || arg === '--watch');
const isminify = args.some((arg) => arg === '-m' || arg === '--minify');

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
    console.error(`failed ${path.basename(cssPath)}: ${err.message}`);
  }
}

async function run() {
  const glob = new Bun.Glob('**/*-styles.css');

  if (iswatch) {
    console.log(`watching files in ${srcdir}...`);

    // bun's native recursive watcher
    const watcher = watch(
      srcdir,
      { recursive: true },
      async (event, filename) => {
        if (!filename || !filename.endsWith('-styles.css')) return;

        const absolutepath = path.join(srcdir, filename);

        if (event === 'rename') {
          const exists = await Bun.file(absolutepath).exists();
          if (!exists) {
            const tspath = `${absolutepath}.ts`;
            try {
              unlinkSync(tspath);
              console.log(`deleted: ${path.basename(tspath)}`);
            } catch {}
            return;
          }
        }
        await convertFile(absolutepath, isminify);
      }
    );

    // initial build
    for await (const file of glob.scan(srcdir)) {
      await convertFile(path.join(srcdir, file), isminify);
    }
  } else {
    const files = Array.from(glob.scanSync(srcdir));
    if (files.length === 0) {
      console.log('no css files found');
      return;
    }

    console.log(`processing ${files.length} files (minify: ${isminify})`);
    await Promise.all(
      files.map((f) => convertFile(path.join(srcdir, f), isminify))
    );
    console.log('build complete');
  }
}

run().catch(() => process.exit(1));
