import { useHouseStore } from '../store/useHouseStore';

const PRESETS = [
  { name: 'Bank', width: 2.0, depth: 0.9, height: 0.8, color: '#8d6e63' },
  { name: 'Bed 2-pers', width: 1.6, depth: 2.0, height: 0.5, color: '#90a4ae' },
  { name: 'Bed 1-pers', width: 0.9, depth: 2.0, height: 0.5, color: '#90a4ae' },
  { name: 'Eettafel', width: 1.6, depth: 0.9, height: 0.75, color: '#a1887f' },
  { name: 'Kast', width: 1.2, depth: 0.6, height: 2.0, color: '#6d4c41' },
  { name: 'Bureau', width: 1.2, depth: 0.6, height: 0.75, color: '#795548' },
];

export function FurniturePanel() {
  const { activeFloorId, images, selectedFurnitureId, furniture, addFurniture, updateFurniture, removeFurniture } =
    useHouseStore();

  const selected = furniture.find((f) => f.id === selectedFurnitureId);
  const floorImage = images.find((i) => i.floorId === activeFloorId);

  function handleAdd(preset: (typeof PRESETS)[number]) {
    addFurniture({
      id: crypto.randomUUID(),
      floorId: activeFloorId,
      x: floorImage ? floorImage.x + floorImage.width / 2 : 0,
      y: floorImage ? floorImage.y + floorImage.height / 2 : 0,
      name: preset.name,
      width: preset.width,
      depth: preset.depth,
      height: preset.height,
      rotation: 0,
      color: preset.color,
    });
  }

  return (
    <div className="furniture-panel">
      <h3>Meubels toevoegen</h3>
      <div className="preset-list">
        {PRESETS.map((p) => (
          <button key={p.name} onClick={() => handleAdd(p)}>
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
              onChange={(e) => updateFurniture(selected.id, { rotation: Number(e.target.value) })}
            />
          </label>
          <label>
            Breedte (m)
            <input
              type="number"
              step={0.1}
              value={selected.width}
              onChange={(e) => updateFurniture(selected.id, { width: Number(e.target.value) })}
            />
          </label>
          <label>
            Diepte (m)
            <input
              type="number"
              step={0.1}
              value={selected.depth}
              onChange={(e) => updateFurniture(selected.id, { depth: Number(e.target.value) })}
            />
          </label>
          <button onClick={() => removeFurniture(selected.id)}>Verwijderen</button>
        </div>
      )}
    </div>
  );
}
