import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FurniturePlacement, HouseModel, Room } from '../types/model';
import { initialModel } from '../data/initialModel';

interface HouseState extends HouseModel {
  activeFloorId: string;
  selectedRoomId: string | null;
  selectedPlacementId: string | null;
  showFurniture: boolean;
  setActiveFloor: (floorId: string) => void;
  selectRoom: (id: string | null) => void;
  selectPlacement: (id: string | null) => void;
  setShowFurniture: (show: boolean) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  addPlacement: (placement: FurniturePlacement) => void;
  updatePlacement: (id: string, updates: Partial<FurniturePlacement>) => void;
  removePlacement: (id: string) => void;
}

export const useHouseStore = create<HouseState>()(
  persist(
    (set) => ({
      ...initialModel,
      activeFloorId: initialModel.floors[0].id,
      selectedRoomId: null,
      selectedPlacementId: null,
      showFurniture: true,

      setActiveFloor: (floorId) => set({ activeFloorId: floorId, selectedRoomId: null, selectedPlacementId: null }),
      selectRoom: (id) => set({ selectedRoomId: id, selectedPlacementId: null }),
      selectPlacement: (id) => set({ selectedPlacementId: id }),
      setShowFurniture: (show) => set({ showFurniture: show }),

      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),

      updateRoom: (id, updates) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      removeRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
          placements: state.placements.filter((p) => p.roomId !== id),
          selectedRoomId: null,
        })),

      addPlacement: (placement) => set((state) => ({ placements: [...state.placements, placement] })),

      updatePlacement: (id, updates) =>
        set((state) => ({
          placements: state.placements.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      removePlacement: (id) =>
        set((state) => ({
          placements: state.placements.filter((p) => p.id !== id),
          selectedPlacementId: null,
        })),
    }),
    { name: 'inrichting-huis-model-v2' }
  )
);
