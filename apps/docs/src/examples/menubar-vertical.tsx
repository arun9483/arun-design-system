import { Menubar } from '@arun-dev/ui';

export default function MenubarVertical() {
  return (
    <Menubar.Root aria-label="Workspace" orientation="vertical">
      <Menubar.Menu>
        <Menubar.Trigger>Projects</Menubar.Trigger>
        <Menubar.Popup>
          <Menubar.Item>New project</Menubar.Item>
          <Menubar.Item>Import</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Team</Menubar.Trigger>
        <Menubar.Popup>
          <Menubar.Item>Invite</Menubar.Item>
          <Menubar.Item>Members</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Settings</Menubar.Trigger>
        <Menubar.Popup>
          <Menubar.Item>Profile</Menubar.Item>
          <Menubar.Item>Billing</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
