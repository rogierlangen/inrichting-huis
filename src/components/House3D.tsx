import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useHouseStore } from '../store/useHouseStore';
import * as THREE from 'three';
import { useMemo } from 'react';
import type { Room, FurnitureItem, Floor } from '../types/model';

function RoomMesh({ room, elevation }: { room: Room; elevation: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    room.points.forEach((p, i) => {
      if (i === 0) s.moveTo(p.x, p.y);
      else s.lineTo(p.x, p.y);
    });
    s.closePath();
    return s;
  }, [room.points]);

  const floorGeometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);

  const wallSegments = useMemo(() => {
    const segments: { from: THREE.Vector2; to: THREE.Vector2 }[] = [];
    for (let i = 0; i < room.points.length; i++) {
      const from = room.points[i];
      const to = room.points[(i + 1) % room.points.length];
      segments.push({ from: new THREE.Vector2(from.x, from.y), to: new THREE.Vector2(to.x, to.y) });
    }
    return segments;
  }, [room.points]);

  return (
    <group position={[0, elevation, 0]}>
      <mesh geometry={floorGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color={room.color ?? '#ddd'} side={THREE.DoubleSide} />
      </mesh>
      {wallSegments.map((seg, idx) => {
        const length = seg.from.distanceTo(seg.to);
        const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
        const midX = (seg.from.x + seg.to.x) / 2;
        const midY = (seg.from.y + seg.to.y) / 2;
        return (
          <mesh
            key={idx}
            position={[midX, room.wallHeight / 2, midY]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[length, room.wallHeight, 0.12]} />
            <meshStandardMaterial color="#f5f1e8" />
          </mesh>
        );
      })}
    </group>
  );
}

function FurnitureMesh({ item, elevation }: { item: FurnitureItem; elevation: number }) {
  return (
    <mesh
      position={[item.x, elevation + item.height / 2, item.y]}
      rotation={[0, (-item.rotation * Math.PI) / 180, 0]}
    >
      <boxGeometry args={[item.width, item.height, item.depth]} />
      <meshStandardMaterial color={item.color ?? '#b08968'} />
    </mesh>
  );
}

function FloorGroup({ floor }: { floor: Floor }) {
  const rooms = useHouseStore((s) => s.rooms.filter((r) => r.floorId === floor.id));
  const furniture = useHouseStore((s) =>
    s.furniture.filter((f) => rooms.some((r) => r.id === f.roomId))
  );

  return (
    <group>
      {rooms.map((room) => (
        <RoomMesh key={room.id} room={room} elevation={floor.elevation} />
      ))}
      {furniture.map((item) => (
        <FurnitureMesh key={item.id} item={item} elevation={floor.elevation} />
      ))}
    </group>
  );
}

export function House3D() {
  const floors = useHouseStore((s) => s.floors);

  return (
    <Canvas camera={{ position: [12, 12, 12], fov: 50 }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      {floors.map((floor) => (
        <FloorGroup key={floor.id} floor={floor} />
      ))}
      <gridHelper args={[40, 40]} />
      <OrbitControls />
    </Canvas>
  );
}
