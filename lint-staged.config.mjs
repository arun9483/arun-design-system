import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const rootDir = resolve(import.meta.dirname);
const prettierIgnorePath = resolve(rootDir, '.prettierignore');

/**
 * Every workspace that ships its own eslint.config.mjs, discovered rather than
 * listed — a hardcoded list silently lints new workspaces against the root config,
 * so their local overrides are ignored.
 */
function discoverWorkspaceConfigs() {
  const found = [];

  for (const group of ['packages', 'apps']) {
    const groupDir = resolve(rootDir, group);
    if (!existsSync(groupDir)) continue;

    for (const entry of readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(group, entry.name);
      const config = join(dir, 'eslint.config.mjs');
      if (existsSync(resolve(rootDir, config))) found.push({ dir, config });
    }
  }

  return found;
}

const workspaceConfigs = discoverWorkspaceConfigs();

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
