import { useState } from 'react';
import { useHouseStore } from '../store/useHouseStore';

export function RoomList() {
  const { activeFloorId, rooms, selectedRoomId, selectRoom, addRoom, removeRoom } = useHouseStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [widthM, setWidthM] = useState('4');
  const [lengthM, setLengthM] = useState('3');

  const floorRooms = rooms.filter((r) => r.floorId === activeFloorId);

  function handleAdd() {
    if (!name.trim()) return;
    const room = {
      id: crypto.randomUUID(),
      floorId: activeFloorId,
      name: name.trim(),
      widthM: parseFloat(widthM) || 1,
      lengthM: parseFloat(lengthM) || 1,
    };
    addRoom(room);
    selectRoom(room.id);
    setName('');
    setWidthM('4');
    setLengthM('3');
    setShowForm(false);
  }

  return (
    <div className="room-list">
      <h3>Kamers</h3>
      <ul>
        {floorRooms.map((room) => (
          <li key={room.id}>
            <button className={room.id === selectedRoomId ? 'active' : ''} onClick={() => selectRoom(room.id)}>
              {room.name}
              <span className="room-dims">
                {room.widthM}×{room.lengthM} m
              </span>
            </button>
            {room.id === selectedRoomId && (
              <button className="delete-btn" onClick={() => removeRoom(room.id)} title="Kamer verwijderen">
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      {!showForm && <button onClick={() => setShowForm(true)}>+ Kamer toevoegen</button>}

      {showForm && (
        <div className="add-room-form">
          <label>
            Naam
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Woonkamer" />
          </label>
          <label>
            Breedte (m)
            <input type="number" step={0.1} value={widthM} onChange={(e) => setWidthM(e.target.value)} />
          </label>
          <label>
            Lengte (m)
            <input type="number" step={0.1} value={lengthM} onChange={(e) => setLengthM(e.target.value)} />
          </label>
          <div className="form-actions">
            <button onClick={handleAdd}>Toevoegen</button>
            <button onClick={() => setShowForm(false)}>Annuleren</button>
          </div>
        </div>
      )}
    </div>
  );
}
