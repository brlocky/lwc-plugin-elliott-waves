import { dirname, resolve } from 'node:path';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { build, defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { generateDtsBundle } from 'dts-bundle-generator';
import { readdirSync, readFileSync } from 'node:fs';

function buildPackageJson(packageName, version) {
  /*
	 Define the contents of the package's package.json here.
	 */
  return {
    name: packageName,
    version: version,
    keywords: ['lwc-plugin', 'lightweight-charts'],
    type: 'module',
    main: `./${packageName}.umd.cjs`,
    module: `./${packageName}.js`,
    types: `./${packageName}.d.ts`,
    style: 'style.css', // Add this line to include your CSS file
    exports: {
      import: {
        types: `./${packageName}.d.ts`,
        default: `./${packageName}.js`,
      },
      require: {
        types: `./${packageName}.d.cts`,
        default: `./${packageName}.umd.cjs`,
      },
    },
  };
}

const __filename = fileURLToPath(import.meta.url);
const currentDir = dirname(__filename);

const pluginFileName = 'elliott-waves';
const pluginFile = resolve(currentDir, 'src', `${pluginFileName}.ts`);

const pluginsToBuild = [
  {
    filepath: pluginFile,
    exportName: 'lwc-plugin-elliott-waves',
    name: 'ElliottWaves',
  },
];

const compiledFolder = resolve(currentDir, 'dist');
if (!existsSync(compiledFolder)) {
  mkdirSync(compiledFolder);
}

const buildConfig = ({ filepath, name, exportName, formats = ['es', 'umd'] }) => {
  return defineConfig({
    publicDir: false,
    build: {
      outDir: `dist`,
      emptyOutDir: true,
      copyPublicDir: false,
      lib: {
        entry: filepath,
        name,
        formats,
        fileName: exportName,
      },
      rollupOptions: {
        external: ['lightweight-charts', 'fancy-canvas'],
        output: {
          globals: {
            'lightweight-charts': 'LightweightCharts',
          },
        },
      },
    },
  });
};

const startTime = Date.now().valueOf();
console.log('⚡️ Starting');
console.log('Bundling the plugin...');
const promises = pluginsToBuild.map((file) => {
  return build(buildConfig(file));
});
await Promise.all(promises);
console.log('Generating the package.json file...');
pluginsToBuild.forEach((file) => {
  const packagePath = resolve(compiledFolder, 'package.json');
  const package2Path = resolve(currentDir, 'package.json');
  const existingPackageJson = JSON.parse(readFileSync(package2Path, 'utf-8'));
  const existingVersion = existingPackageJson.version;
  const content = JSON.stringify(buildPackageJson(file.exportName, existingVersion), undefined, 4);
  writeFileSync(packagePath, content, { encoding: 'utf-8' });
});

console.log('Generating the typings files...');
pluginsToBuild.forEach((file) => {
  try {
    const esModuleTyping = generateDtsBundle([
      {
        filePath: `./typings/${pluginFileName}.d.ts`,
      },
    ]);
    const typingFilePath = resolve(compiledFolder, `${file.exportName}.d.ts`);
    writeFileSync(typingFilePath, esModuleTyping.join('\n'), {
      encoding: 'utf-8',
    });
    copyFileSync(typingFilePath, resolve(compiledFolder, `${file.exportName}.d.cts`));
  } catch (e) {
    console.error('Error generating typings for: ', file.exportName);
  }
});

const endTime = Date.now().valueOf();
console.log(`🎉 Done (${endTime - startTime}ms)`);
