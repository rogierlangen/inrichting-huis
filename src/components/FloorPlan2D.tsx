import { useMemo, useRef, useState } from 'react';
import { useHouseStore } from '../store/useHouseStore';
import type { FurnitureItem } from '../types/model';

function polygonToPoints(points: { x: number; y: number }[], pxPerMeter: number) {
  return points.map((p) => `${p.x * pxPerMeter},${p.y * pxPerMeter}`).join(' ');
}

const ROOM_COLORS = ['#f3c98f', '#cfe8d8', '#cfe0ef', '#f1e4c2', '#e3e3e3', '#d8cdb8', '#f6d98a'];

export function FloorPlan2D() {
  const {
    activeFloorId,
    rooms,
    furniture,
    images,
    selectedFurnitureId,
    selectFurniture,
    selectRoom,
    selectedRoomId,
    updateFurniture,
    setFloorImage,
    addRoom,
    removeRoom,
  } = useHouseStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calPoints, setCalPoints] = useState<{ x: number; y: number }[]>([]);
  const [showRooms, setShowRooms] = useState(true);
  const [pxPerMeter, setPxPerMeter] = useState(60);
  const [drawingRoom, setDrawingRoom] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);

  const floorRooms = useMemo(() => rooms.filter((r) => r.floorId === activeFloorId), [rooms, activeFloorId]);
  const floorFurniture = useMemo(
    () => furniture.filter((f) => f.floorId === activeFloorId),
    [furniture, activeFloorId]
  );
  const floorImage = images.find((i) => i.floorId === activeFloorId);

  const bounds = useMemo(() => {
    const allPoints = floorRooms.flatMap((r) => r.points).concat(drawPoints);
    if (floorImage) {
      allPoints.push(
        { x: floorImage.x, y: floorImage.y },
        { x: floorImage.x + floorImage.width, y: floorImage.y + floorImage.height }
      );
    }
    if (allPoints.length === 0) return { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    return {
      minX: Math.min(...allPoints.map((p) => p.x)) - 1,
      minY: Math.min(...allPoints.map((p) => p.y)) - 1,
      maxX: Math.max(...allPoints.map((p) => p.x)) + 1,
      maxY: Math.max(...allPoints.map((p) => p.y)) + 1,
    };
  }, [floorRooms, floorImage, drawPoints]);

  const width = (bounds.maxX - bounds.minX) * pxPerMeter;
  const height = (bounds.maxY - bounds.minY) * pxPerMeter;

  function toLocalMeters(clientX: number, clientY: number) {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left) / pxPerMeter + bounds.minX;
    const y = (clientY - rect.top) / pxPerMeter + bounds.minY;
    return { x, y };
  }

  function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        const widthMeters = 10;
        const heightMeters = widthMeters * (img.naturalHeight / img.naturalWidth);
        setFloorImage({
          floorId: activeFloorId,
          src,
          x: 0,
          y: 0,
          width: widthMeters,
          height: heightMeters,
          opacity: 1,
        });
        setShowRooms(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  function handleDrawClick(clientX: number, clientY: number) {
    const p = toLocalMeters(clientX, clientY);
    setDrawPoints((prev) => [...prev, p]);
  }

  function finishRoom() {
    if (drawPoints.length < 3) {
      setDrawPoints([]);
      setDrawingRoom(false);
      return;
    }
    const name = window.prompt('Naam van de kamer?', 'Kamer');
    if (!name) {
      setDrawPoints([]);
      setDrawingRoom(false);
      return;
    }
    const heightStr = window.prompt('Wandhoogte in meters?', '2.5');
    const wallHeight = heightStr ? parseFloat(heightStr) : 2.5;
    addRoom({
      id: crypto.randomUUID(),
      name,
      floorId: activeFloorId,
      points: drawPoints,
      wallHeight: Number.isFinite(wallHeight) && wallHeight > 0 ? wallHeight : 2.5,
      color: ROOM_COLORS[floorRooms.length % ROOM_COLORS.length],
    });
    setDrawPoints([]);
    setDrawingRoom(false);
  }

  function cancelDrawing() {
    setDrawPoints([]);
    setDrawingRoom(false);
  }

  function handleCalibrationClick(clientX: number, clientY: number) {
    const p = toLocalMeters(clientX, clientY);
    const next = [...calPoints, p];
    if (next.length === 2) {
      const dx = next[1].x - next[0].x;
      const dy = next[1].y - next[0].y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const real = window.prompt('Werkelijke afstand tussen de twee punten in meters?', '1.00');
      if (real && floorImage) {
        const scale = parseFloat(real) / pixelDist;
        setFloorImage({
          ...floorImage,
          width: floorImage.width * scale,
          height: floorImage.height * scale,
        });
      }
      setCalPoints([]);
      setCalibrating(false);
    } else {
      setCalPoints(next);
    }
  }

  function startDragFurniture(item: FurnitureItem, e: React.PointerEvent) {
    selectFurniture(item.id);
    const local = toLocalMeters(e.clientX, e.clientY);
    setDrag({ id: item.id, offsetX: local.x - item.x, offsetY: local.y - item.y });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const local = toLocalMeters(e.clientX, e.clientY);
    updateFurniture(drag.id, { x: local.x - drag.offsetX, y: local.y - drag.offsetY });
  }

  return (
    <div className="floorplan2d">
      <div className="toolbar">
        <label className="upload-btn">
          Plattegrond uploaden
          <input type="file" accept="image/*" onChange={handleBackgroundUpload} hidden />
        </label>
        {floorImage && (
          <button onClick={() => setCalibrating(true)} disabled={calibrating}>
            {calibrating ? 'Klik twee punten op de afbeelding...' : 'Schaal calibreren'}
          </button>
        )}
        {floorImage && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <input type="checkbox" checked={showRooms} onChange={(e) => setShowRooms(e.target.checked)} />
            Kamer-vlakken tonen
          </label>
        )}
        {!drawingRoom && (
          <button onClick={() => setDrawingRoom(true)}>Kamer tekenen</button>
        )}
        {drawingRoom && (
          <>
            <span style={{ fontSize: 13 }}>Klik de hoekpunten van de kamer, dan "Klaar"...</span>
            <button onClick={finishRoom} disabled={drawPoints.length < 3}>Klaar</button>
            <button onClick={cancelDrawing}>Annuleren</button>
          </>
        )}
        {selectedRoomId && (
          <button onClick={() => removeRoom(selectedRoomId)}>Kamer verwijderen</button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <button onClick={() => setPxPerMeter((z) => Math.max(10, z - 10))}>−</button>
          <span style={{ fontSize: 13 }}>{Math.round((pxPerMeter / 60) * 100)}%</span>
          <button onClick={() => setPxPerMeter((z) => Math.min(200, z + 10))}>+</button>
        </div>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDrag(null)}
        onClick={(e) => {
          if (calibrating) handleCalibrationClick(e.clientX, e.clientY);
          else if (drawingRoom) handleDrawClick(e.clientX, e.clientY);
        }}
        style={{
          background: '#fafafa',
          border: '1px solid #ccc',
          cursor: calibrating || drawingRoom ? 'crosshair' : 'default',
        }}
      >
        {floorImage && (
          <image
            href={floorImage.src}
            x={(floorImage.x - bounds.minX) * pxPerMeter}
            y={(floorImage.y - bounds.minY) * pxPerMeter}
            width={floorImage.width * pxPerMeter}
            height={floorImage.height * pxPerMeter}
            opacity={floorImage.opacity}
          />
        )}

        {showRooms &&
          floorRooms.map((room) => {
            const translated = room.points.map((p) => ({ x: p.x - bounds.minX, y: p.y - bounds.minY }));
            const centroid = {
              x: translated.reduce((s, p) => s + p.x, 0) / translated.length,
              y: translated.reduce((s, p) => s + p.y, 0) / translated.length,
            };
            return (
              <g key={room.id} onClick={() => selectRoom(room.id)} style={{ cursor: 'pointer' }}>
                <polygon
                  points={polygonToPoints(translated, pxPerMeter)}
                  fill={room.color ?? '#eee'}
                  stroke={selectedRoomId === room.id ? '#1a73e8' : '#333'}
                  strokeWidth={selectedRoomId === room.id ? 2 : 1}
                  opacity={floorImage ? 0.35 : 0.9}
                />
                <text x={centroid.x * pxPerMeter} y={centroid.y * pxPerMeter} fontSize={12} textAnchor="middle" fill="#222">
                  {room.name}
                </text>
              </g>
            );
          })}

        {floorFurniture.map((item) => {
          const x = (item.x - bounds.minX) * pxPerMeter;
          const y = (item.y - bounds.minY) * pxPerMeter;
          const w = item.width * pxPerMeter;
          const d = item.depth * pxPerMeter;
          return (
            <g
              key={item.id}
              transform={`translate(${x},${y}) rotate(${item.rotation})`}
              onPointerDown={(e) => startDragFurniture(item, e)}
              style={{ cursor: 'grab' }}
            >
              <rect
                x={-w / 2}
                y={-d / 2}
                width={w}
                height={d}
                fill={item.color ?? '#b08968'}
                stroke={selectedFurnitureId === item.id ? '#1a73e8' : '#444'}
                strokeWidth={selectedFurnitureId === item.id ? 2 : 1}
              />
              <text y={4} fontSize={10} textAnchor="middle" fill="#fff">
                {item.name}
              </text>
            </g>
          );
        })}

        {drawingRoom && drawPoints.length > 0 && (
          <g>
            {drawPoints.length > 1 && (
              <polyline
                points={polygonToPoints(
                  drawPoints.map((p) => ({ x: p.x - bounds.minX, y: p.y - bounds.minY })),
                  pxPerMeter
                )}
                fill="none"
                stroke="#1a73e8"
                strokeWidth={2}
                strokeDasharray="6,4"
              />
            )}
            {drawPoints.map((p, idx) => (
              <circle
                key={idx}
                cx={(p.x - bounds.minX) * pxPerMeter}
                cy={(p.y - bounds.minY) * pxPerMeter}
                r={4}
                fill="#1a73e8"
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
