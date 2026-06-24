import { create } from 'zustand';
import type { FloorPlanImage, FurnitureItem, HouseModel, Room } from '../types/model';
import { initialModel } from '../data/initialModel';

interface HouseState extends HouseModel {
  activeFloorId: string;
  selectedRoomId: string | null;
  selectedFurnitureId: string | null;
  setActiveFloor: (floorId: string) => void;
  selectRoom: (id: string | null) => void;
  selectFurniture: (id: string | null) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  addFurniture: (item: FurnitureItem) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  removeFurniture: (id: string) => void;
  setFloorImage: (image: FloorPlanImage) => void;
  loadModel: (model: HouseModel) => void;
}

export const useHouseStore = create<HouseState>((set) => ({
  ...initialModel,
  activeFloorId: initialModel.floors[0].id,
  selectedRoomId: null,
  selectedFurnitureId: null,

  setActiveFloor: (floorId) => set({ activeFloorId: floorId, selectedRoomId: null, selectedFurnitureId: null }),
  selectRoom: (id) => set({ selectedRoomId: id, selectedFurnitureId: null }),
  selectFurniture: (id) => set({ selectedFurnitureId: id, selectedRoomId: null }),

  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  addFurniture: (item) => set((state) => ({ furniture: [...state.furniture, item] })),

  updateFurniture: (id, updates) =>
    set((state) => ({
      furniture: state.furniture.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  removeFurniture: (id) =>
    set((state) => ({
      furniture: state.furniture.filter((f) => f.id !== id),
      selectedFurnitureId: null,
    })),

  setFloorImage: (image) =>
    set((state) => ({
      images: [...state.images.filter((i) => i.floorId !== image.floorId), image],
    })),

  loadModel: (model) => set({ ...model, activeFloorId: model.floors[0]?.id ?? '' }),
}));
