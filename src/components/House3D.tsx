import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useHouseStore } from '../store/useHouseStore';
import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import type { Room, FurnitureItem, Floor, FloorPlanImage } from '../types/model';

function FloorPlanTexture({ image, elevation }: { image: FloorPlanImage; elevation: number }) {
  const texture = useMemo(() => new THREE.TextureLoader().load(image.src), [image.src]);
  const centerX = image.x + image.width / 2;
  const centerY = image.y + image.height / 2;
  return (
    <mesh
      position={[centerX, elevation + 0.01, centerY]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[image.width, image.height]} />
      <meshBasicMaterial map={texture} transparent opacity={image.opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

function roomCentroid(room: Room) {
  const x = room.points.reduce((s, p) => s + p.x, 0) / room.points.length;
  const y = room.points.reduce((s, p) => s + p.y, 0) / room.points.length;
  return { x, y };
}

function RoomMesh({
  room,
  elevation,
  onFocus,
}: {
  room: Room;
  elevation: number;
  onFocus: (target: THREE.Vector3, position: THREE.Vector3) => void;
}) {
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

  function handleClick(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    const centroid = roomCentroid(room);
    const target = new THREE.Vector3(centroid.x, elevation + room.wallHeight / 3, centroid.y);
    const radius = Math.max(
      3,
      ...room.points.map((p) => Math.hypot(p.x - centroid.x, p.y - centroid.y) * 2.2)
    );
    const position = new THREE.Vector3(
      centroid.x + radius,
      elevation + room.wallHeight * 1.2,
      centroid.y + radius
    );
    onFocus(target, position);
  }

  return (
    <group position={[0, elevation, 0]} onClick={handleClick}>
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

function FloorGroup({
  floor,
  onFocusRoom,
}: {
  floor: Floor;
  onFocusRoom: (target: THREE.Vector3, position: THREE.Vector3) => void;
}) {
  const rooms = useHouseStore((s) => s.rooms.filter((r) => r.floorId === floor.id));
  const furniture = useHouseStore((s) => s.furniture.filter((f) => f.floorId === floor.id));
  const floorImage = useHouseStore((s) => s.images.find((i) => i.floorId === floor.id));

  return (
    <group>
      {floorImage && <FloorPlanTexture image={floorImage} elevation={floor.elevation} />}
      {rooms.map((room) => (
        <RoomMesh key={room.id} room={room} elevation={floor.elevation} onFocus={onFocusRoom} />
      ))}
      {furniture.map((item) => (
        <FurnitureMesh key={item.id} item={item} elevation={floor.elevation} />
      ))}
    </group>
  );
}

function CameraRig({
  controlsRef,
  focus,
}: {
  controlsRef: React.RefObject<any>;
  focus: { target: THREE.Vector3; position: THREE.Vector3 } | null;
}) {
  const progress = useRef(0);
  const start = useRef<{ target: THREE.Vector3; position: THREE.Vector3 } | null>(null);

  useFrame((state: any) => {
    if (!focus || !controlsRef.current) return;
    if (progress.current === 0) {
      start.current = {
        target: controlsRef.current.target.clone(),
        position: state.camera.position.clone(),
      };
    }
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + 0.04);
      const t = progress.current;
      if (start.current) {
        controlsRef.current.target.lerpVectors(start.current.target, focus.target, t);
        state.camera.position.lerpVectors(start.current.position, focus.position, t);
      }
      controlsRef.current.update();
    }
  });

  return null;
}

export function House3D() {
  const floors = useHouseStore((s) => s.floors);
  const controlsRef = useRef<any>(null);
  const [focus, setFocus] = useState<{ target: THREE.Vector3; position: THREE.Vector3 } | null>(null);
  const [focusKey, setFocusKey] = useState(0);

  function handleFocusRoom(target: THREE.Vector3, position: THREE.Vector3) {
    setFocus({ target, position });
    setFocusKey((k) => k + 1);
  }

  return (
    <Canvas camera={{ position: [12, 12, 12], fov: 50 }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      {floors.map((floor) => (
        <FloorGroup key={floor.id} floor={floor} onFocusRoom={handleFocusRoom} />
      ))}
      <gridHelper args={[40, 40]} />
      <OrbitControls ref={controlsRef} />
      <CameraRig key={focusKey} controlsRef={controlsRef} focus={focus} />
    </Canvas>
  );
}
