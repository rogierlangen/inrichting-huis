export interface Floor {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  floorId: string;
  name: string;
  widthM: number;
  lengthM: number;
  photoSrc?: string; // foto van de lege kamer, bron van waarheid voor het aanzicht
}

export interface FurniturePlacement {
  id: string;
  roomId: string;
  name: string;
  color: string;
  xPct: number; // center, 0-100, relatief aan de foto
  yPct: number; // center, 0-100, relatief aan de foto
  widthPct: number; // 0-100, relatief aan fotobreedte
  heightPct: number; // 0-100, relatief aan fotohoogte
  rotation: number; // graden
}

export interface HouseModel {
  floors: Floor[];
  rooms: Room[];
  placements: FurniturePlacement[];
}
