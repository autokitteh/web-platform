/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, 'src/assets/templates');

const escapeContent = (content) => {
  return content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
};

const generateIndex = (directoryPath) => {
  const files = fs.readdirSync(directoryPath)
    .filter(file => fs.lstatSync(path.join(directoryPath, file)).isFile())
    .filter(file => !file.endsWith('.md'));

  const exports = files.map(file => {
    const filePath = path.join(directoryPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const exportName = path.basename(file).replace(/[^a-zA-Z0-9_]/g, '_');
    if (file === 'autokitteh.yaml') {
      return;
    }

    return `export const ${exportName} = \`${escapeContent(content)}\`;`;
  }).join('\n');

  const indexPath = path.join(directoryPath, 'index.js');
  fs.writeFileSync(indexPath, exports);
};

const generateTopLevelIndex = (basePath) => {
  const directories = fs.readdirSync(basePath).filter(file => fs.lstatSync(path.join(basePath, file)).isDirectory());

  const imports = directories.map(dir => {
    return `import * as ${dir} from './${dir}/index.js';`;
  }).join('\n');

  const yamlImports = directories.map(dir => {
    const yamlFilePath = path.join(basePath, dir, 'autokitteh.yaml');
    if (fs.existsSync(yamlFilePath)) {
      return `import ${dir} from '@assets/templates/${dir}/autokitteh.yaml';`;
    }

    return '';
  }).filter(Boolean).join('\n');

  const exports = directories.map(dir => {
    return `${dir}`;
  }).join(',\n  ');

  const yamlExports = directories.map(dir => {
    const yamlFilePath = path.join(basePath, dir, 'autokitteh.yaml');
    if (fs.existsSync(yamlFilePath)) {
      return `${dir}`;
    }

    return '';
  }).filter(Boolean).join(',\n  ');

  const indexContent = `${imports}\n${yamlImports}\n\nexport {\n  ${exports},\n  ${yamlExports}\n};`;

  fs.writeFileSync(path.join(basePath, 'index.js'), indexContent);
};

const generateIndexes = (basePath) => {
  const directories = fs.readdirSync(basePath).filter(file => fs.lstatSync(path.join(basePath, file)).isDirectory());
  directories.forEach(dir => generateIndex(path.join(basePath, dir)));
  generateTopLevelIndex(basePath);
};

generateIndexes(basePath);
