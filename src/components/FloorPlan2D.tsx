import { useMemo, useRef, useState } from 'react';
import { useHouseStore } from '../store/useHouseStore';
import type { FurnitureItem } from '../types/model';

const PX_PER_METER = 40;

function polygonToPoints(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x * PX_PER_METER},${p.y * PX_PER_METER}`).join(' ');
}

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
  } = useHouseStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calPoints, setCalPoints] = useState<{ x: number; y: number }[]>([]);

  const floorRooms = useMemo(() => rooms.filter((r) => r.floorId === activeFloorId), [rooms, activeFloorId]);
  const floorFurniture = useMemo(
    () => furniture.filter((f) => floorRooms.some((r) => r.id === f.roomId)),
    [furniture, floorRooms]
  );
  const floorImage = images.find((i) => i.floorId === activeFloorId);

  const bounds = useMemo(() => {
    const allPoints = floorRooms.flatMap((r) => r.points);
    if (allPoints.length === 0) return { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    return {
      minX: Math.min(...allPoints.map((p) => p.x)) - 1,
      minY: Math.min(...allPoints.map((p) => p.y)) - 1,
      maxX: Math.max(...allPoints.map((p) => p.x)) + 1,
      maxY: Math.max(...allPoints.map((p) => p.y)) + 1,
    };
  }, [floorRooms]);

  const width = (bounds.maxX - bounds.minX) * PX_PER_METER;
  const height = (bounds.maxY - bounds.minY) * PX_PER_METER;

  function toLocalMeters(clientX: number, clientY: number) {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left) / PX_PER_METER + bounds.minX;
    const y = (clientY - rect.top) / PX_PER_METER + bounds.minY;
    return { x, y };
  }

  function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFloorImage({
        floorId: activeFloorId,
        src: reader.result as string,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        opacity: 0.6,
      });
    };
    reader.readAsDataURL(file);
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
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDrag(null)}
        onClick={(e) => {
          if (calibrating) handleCalibrationClick(e.clientX, e.clientY);
        }}
        style={{ background: '#fafafa', border: '1px solid #ccc', cursor: calibrating ? 'crosshair' : 'default' }}
      >
        {floorImage && (
          <image
            href={floorImage.src}
            x={(floorImage.x - bounds.minX) * PX_PER_METER}
            y={(floorImage.y - bounds.minY) * PX_PER_METER}
            width={floorImage.width * PX_PER_METER}
            height={floorImage.height * PX_PER_METER}
            opacity={floorImage.opacity}
          />
        )}

        {floorRooms.map((room) => {
          const translated = room.points.map((p) => ({ x: p.x - bounds.minX, y: p.y - bounds.minY }));
          const centroid = {
            x: translated.reduce((s, p) => s + p.x, 0) / translated.length,
            y: translated.reduce((s, p) => s + p.y, 0) / translated.length,
          };
          return (
            <g key={room.id} onClick={() => selectRoom(room.id)} style={{ cursor: 'pointer' }}>
              <polygon
                points={polygonToPoints(translated)}
                fill={room.color ?? '#eee'}
                stroke={selectedRoomId === room.id ? '#1a73e8' : '#333'}
                strokeWidth={selectedRoomId === room.id ? 2 : 1}
                opacity={floorImage ? 0.55 : 0.9}
              />
              <text x={centroid.x * PX_PER_METER} y={centroid.y * PX_PER_METER} fontSize={12} textAnchor="middle" fill="#222">
                {room.name}
              </text>
            </g>
          );
        })}

        {floorFurniture.map((item) => {
          const x = (item.x - bounds.minX) * PX_PER_METER;
          const y = (item.y - bounds.minY) * PX_PER_METER;
          const w = item.width * PX_PER_METER;
          const d = item.depth * PX_PER_METER;
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
      </svg>
    </div>
  );
}
