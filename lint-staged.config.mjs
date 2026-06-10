import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname);
const prettierIgnorePath = resolve(rootDir, '.prettierignore');

const workspaceConfigs = [
  { dir: 'packages/tokens', config: 'packages/tokens/eslint.config.mjs' },
  { dir: 'packages/ui', config: 'packages/ui/eslint.config.mjs' },
  { dir: 'packages/config', config: 'packages/config/eslint.config.mjs' },
];

function getEslintCommand(files) {
  const commands = [];

  for (const { dir, config } of workspaceConfigs) {
    const prefix = resolve(rootDir, dir);
    const configPath = resolve(rootDir, config);
    const matched = files.filter((f) => f.startsWith(prefix));
    if (matched.length > 0) {
      commands.push(`eslint --fix -c ${configPath} ${matched.join(' ')}`);
    }
  }

  const workspacePrefixes = workspaceConfigs.map(({ dir }) => resolve(rootDir, dir));
  const rootFiles = files.filter((f) => !workspacePrefixes.some((p) => f.startsWith(p)));
  if (rootFiles.length > 0) {
    commands.push(`eslint --fix ${rootFiles.join(' ')}`);
  }

  return commands;
}

export default {
  '*.{ts,tsx,js,mjs,cjs}': (files) => [
    ...getEslintCommand(files),
    `prettier --write --ignore-path ${prettierIgnorePath} ${files.join(' ')}`,
  ],
  '*.{json,md,mdx,css,yaml,yml}': (files) => [
    `prettier --write --ignore-path ${prettierIgnorePath} ${files.join(' ')}`,
  ],
};
