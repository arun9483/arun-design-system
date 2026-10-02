import { Button, Toast, useToastManager } from '@arun-dev/ui';

// The Provider and Viewport go near your app's root, once. Here they wrap the example.
export default function ToastBasics() {
  return (
    <Toast.Provider>
      <Buttons />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

function Buttons() {
  const toast = useToastManager();

  function archive() {
    const id = toast.add({
      title: 'Conversation archived',
      type: 'success',
      action: {
        label: 'Undo',
        onClick: () => {
          toast.close(id);
          toast.add({ title: 'Restored', timeout: 2000 });
        },
      },
    });
  }

  function save() {
    // One toast, updated when the work finishes.
    const id = toast.add({ title: 'Saving…', timeout: 0 });
    setTimeout(() => toast.update(id, { title: 'Saved', type: 'success', timeout: 3000 }), 1200);
  }

  function fail() {
    toast.add({
      title: 'Connection lost',
      description: 'Your changes will sync when you are back online.',
      type: 'error',
      priority: 'high',
    });
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2xs)', flexWrap: 'wrap' }}>
      <Button onClick={archive}>Archive</Button>
      <Button onClick={save}>Save</Button>
      <Button onClick={fail}>Go offline</Button>
    </div>
  );
}
