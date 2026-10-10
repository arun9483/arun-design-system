import { Combobox } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-sm)', maxInlineSize: '24rem' };
const field = { display: 'grid', gap: 'var(--space-3xs)' };

// Booked rooms are listed but can't be picked, and the arrow keys skip them.
const rooms = [
  { id: 'atlas', label: 'Atlas', booked: false },
  { id: 'borealis', label: 'Borealis', booked: true },
  { id: 'cascade', label: 'Cascade', booked: false },
  { id: 'delta', label: 'Delta', booked: true },
  { id: 'everest', label: 'Everest', booked: false },
  { id: 'fjord', label: 'Fjord', booked: false },
];

type Room = (typeof rooms)[number];

// Nothing is selected to start with. `disabled` works the same in single and multiple select.
export default function ComboboxDisabled() {
  return (
    <div style={stack}>
      <div style={field}>
        <label htmlFor="combobox-disabled-room">Room</label>
        <Combobox.Root items={rooms} itemToKey={roomId} name="room">
          <Combobox.Input id="combobox-disabled-room" placeholder="Pick a room…" />
          <Combobox.Popup>
            <Combobox.List>{renderRoom}</Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </div>

      <div style={field}>
        <label htmlFor="combobox-disabled-rooms">Rooms</label>
        <Combobox.Root items={rooms} itemToKey={roomId} multiple name="rooms">
          <Combobox.Input id="combobox-disabled-rooms" placeholder="Pick rooms…" />
          <Combobox.Popup>
            <Combobox.List>{renderRoom}</Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </div>
    </div>
  );
}

function renderRoom(room: Room) {
  return (
    <Combobox.Item key={room.id} value={room} disabled={room.booked}>
      {room.label}
      {room.booked && ' (booked)'}
    </Combobox.Item>
  );
}

function roomId(room: Room) {
  return room.id;
}
