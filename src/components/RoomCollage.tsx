import { useRef, useState } from 'react';
import { useHouseStore } from '../store/useHouseStore';
import type { FurniturePlacement } from '../types/model';

const PRESETS = [
  { name: 'Bank', widthPct: 30, heightPct: 14, color: '#8d6e63' },
  { name: 'Bed 2-pers', widthPct: 26, heightPct: 32, color: '#90a4ae' },
  { name: 'Bed 1-pers', widthPct: 16, heightPct: 30, color: '#90a4ae' },
  { name: 'Eettafel', widthPct: 24, heightPct: 16, color: '#a1887f' },
  { name: 'Kast', widthPct: 18, heightPct: 8, color: '#6d4c41' },
  { name: 'Bureau', widthPct: 18, heightPct: 9, color: '#795548' },
];

type DragMode = { id: string; mode: 'move' | 'resize'; startX: number; startY: number; orig: FurniturePlacement };

export function RoomCollage() {
  const {
    activeFloorId,
    rooms,
    placements,
    selectedRoomId,
    selectedPlacementId,
    selectPlacement,
    showFurniture,
    setShowFurniture,
    updateRoom,
    addPlacement,
    updatePlacement,
    removePlacement,
  } = useHouseStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode | null>(null);

  const room = rooms.find((r) => r.id === selectedRoomId && r.floorId === activeFloorId);
  const roomPlacements = placements.filter((p) => p.roomId === room?.id);
  const selected = roomPlacements.find((p) => p.id === selectedPlacementId);

  if (!room) {
    return <div className="room-collage empty-state">Selecteer of voeg een kamer toe om te beginnen.</div>;
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateRoom(room!.id, { photoSrc: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleAddFurniture(preset: (typeof PRESETS)[number]) {
    const placement: FurniturePlacement = {
      id: crypto.randomUUID(),
      roomId: room!.id,
      name: preset.name,
      color: preset.color,
      xPct: 50,
      yPct: 50,
      widthPct: preset.widthPct,
      heightPct: preset.heightPct,
      rotation: 0,
    };
    addPlacement(placement);
    selectPlacement(placement.id);
  }

  function startDrag(e: React.PointerEvent, placement: FurniturePlacement, mode: 'move' | 'resize') {
    e.stopPropagation();
    selectPlacement(placement.id);
    setDrag({ id: placement.id, mode, startX: e.clientX, startY: e.clientY, orig: placement });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    if (drag.mode === 'move') {
      updatePlacement(drag.id, {
        xPct: Math.min(100, Math.max(0, drag.orig.xPct + dxPct)),
        yPct: Math.min(100, Math.max(0, drag.orig.yPct + dyPct)),
      });
    } else {
      updatePlacement(drag.id, {
        widthPct: Math.max(4, drag.orig.widthPct + dxPct),
        heightPct: Math.max(4, drag.orig.heightPct + dyPct),
      });
    }
  }

  return (
    <div className="room-collage">
      <div className="collage-toolbar">
        <h3>{room.name}</h3>
        <span className="room-dims">
          {room.widthM}×{room.lengthM} m
        </span>
        <label className="upload-btn">
          {room.photoSrc ? 'Foto vervangen' : 'Foto van kamer uploaden'}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
        </label>
        <label className="toggle-furniture">
          <input type="checkbox" checked={showFurniture} onChange={(e) => setShowFurniture(e.target.checked)} />
          Ingericht tonen
        </label>
      </div>

      <div
        ref={containerRef}
        className="collage-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDrag(null)}
        onClick={() => selectPlacement(null)}
        style={{
          backgroundImage: room.photoSrc ? `url(${room.photoSrc})` : undefined,
          aspectRatio: `${room.widthM} / ${room.lengthM}`,
        }}
      >
        {!room.photoSrc && <div className="collage-placeholder">Nog geen foto geüpload</div>}

        {showFurniture &&
          roomPlacements.map((p) => (
            <div
              key={p.id}
              className={`placement ${p.id === selectedPlacementId ? 'selected' : ''}`}
              style={{
                left: `${p.xPct}%`,
                top: `${p.yPct}%`,
                width: `${p.widthPct}%`,
                height: `${p.heightPct}%`,
                background: p.color,
                transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
              }}
              onPointerDown={(e) => startDrag(e, p, 'move')}
            >
              <span>{p.name}</span>
              <div
                className="resize-handle"
                onPointerDown={(e) => startDrag(e, p, 'resize')}
              />
            </div>
          ))}
      </div>

      <div className="collage-furniture-panel">
        <h4>Meubels toevoegen</h4>
        <div className="preset-list">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => handleAddFurniture(p)}>
              + {p.name}
            </button>
          ))}
        </div>

        {selected && (
          <div className="selected-furniture">
            <h4>{selected.name}</h4>
            <label>
              Rotatie
              <input
                type="range"
                min={0}
                max={359}
                value={selected.rotation}
                onChange={(e) => updatePlacement(selected.id, { rotation: Number(e.target.value) })}
              />
            </label>
            <button onClick={() => removePlacement(selected.id)}>Verwijderen</button>
          </div>
        )}
      </div>
    </div>
  );
}
