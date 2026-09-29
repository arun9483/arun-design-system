import { Tabs } from '@arun-dev/ui';

export default function TabsBasics() {
  return (
    <Tabs.Root defaultValue="account" style={{ inlineSize: '100%' }}>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab value="team" disabled>
          Team
        </Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account">Name, email and avatar.</Tabs.Panel>
      <Tabs.Panel value="billing">Plan, invoices and payment method.</Tabs.Panel>
      <Tabs.Panel value="team">Members and roles.</Tabs.Panel>
      <Tabs.Panel value="security">Password and two-factor authentication.</Tabs.Panel>
    </Tabs.Root>
  );
}
