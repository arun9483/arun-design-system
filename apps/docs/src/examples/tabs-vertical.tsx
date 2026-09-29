import { Tabs } from '@arun-dev/ui';

export default function TabsVertical() {
  return (
    // Vertical: Up and Down move between tabs. Manual: they only move focus, and Enter or
    // Space selects — for panels that are slow to show.
    <Tabs.Root
      defaultValue="general"
      orientation="vertical"
      activationMode="manual"
      style={{ inlineSize: '100%' }}
    >
      <Tabs.List aria-label="Preferences">
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        <Tabs.Tab value="privacy">Privacy</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general">Language, time zone and theme.</Tabs.Panel>
      <Tabs.Panel value="notifications">Email and push notifications.</Tabs.Panel>
      <Tabs.Panel value="privacy">Who can see your profile.</Tabs.Panel>
    </Tabs.Root>
  );
}
