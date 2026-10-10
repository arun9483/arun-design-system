import { Tabs } from '@arun-dev/ui';

const PACKAGES = '@arun-dev/tokens @arun-dev/headless @arun-dev/ui';

const MANAGERS = [
  { name: 'npm', command: `npm install ${PACKAGES}` },
  { name: 'pnpm', command: `pnpm add ${PACKAGES}` },
  { name: 'yarn', command: `yarn add ${PACKAGES}` },
];

/** The install command for each package manager, in the design system's own Tabs. */
export default function InstallCommands() {
  return (
    <Tabs.Root defaultValue="npm" className="not-content">
      <Tabs.List aria-label="Package manager">
        {MANAGERS.map(({ name }) => (
          <Tabs.Tab key={name} value={name}>
            {name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {MANAGERS.map(({ name, command }) => (
        <Tabs.Panel key={name} value={name}>
          {/* Focusable, as every code block here is, so a long line can be scrolled. */}
          <pre className="ds-playground-output" tabIndex={0}>
            <code>{command}</code>
          </pre>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
