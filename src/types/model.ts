export interface Point {
  x: number; // meters
  y: number; // meters
}

export interface Room {
  id: string;
  name: string;
  floorId: string;
  points: Point[]; // polygon, in meters, clockwise
  wallHeight: number; // meters
  color?: string;
}

export interface FurnitureItem {
  id: string;
  floorId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  rotation: number; // degrees
  color?: string;
}

export interface FloorPlanImage {
  floorId: string;
  src: string; // data URL
  x: number; // meters, top-left position
  y: number;
  width: number; // meters
  height: number;
  opacity: number;
}

export interface Floor {
  id: string;
  name: string;
  elevation: number; // meters, height of floor above ground
}

export interface HouseModel {
  floors: Floor[];
  rooms: Room[];
  furniture: FurnitureItem[];
  images: FloorPlanImage[];
}
