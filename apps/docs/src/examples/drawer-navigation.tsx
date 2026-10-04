import { Button, Drawer, Link, Stack } from '@arun-dev/ui';

const pages = ['Overview', 'Projects', 'Team', 'Billing', 'Settings'];

export default function DrawerNavigation() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button />}>Menu</Drawer.Trigger>
      {/* From the left, for navigation: swipe it back to the left to close it. */}
      <Drawer.Popup side="left">
        <Drawer.Title>Acme workspace</Drawer.Title>
        <nav aria-label="Workspace">
          <Stack gap="xs" render={<ul role="list" />}>
            {pages.map((page) => (
              <li key={page}>
                <Link href="#" aria-current={page === 'Projects' ? 'page' : undefined}>
                  {page}
                </Link>
              </li>
            ))}
          </Stack>
        </nav>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
