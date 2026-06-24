import type { HouseModel } from '../types/model';

const GF = 'begane-grond';
const FF = 'verdieping';

export const initialModel: HouseModel = {
  floors: [
    { id: GF, name: 'Begane grond' },
    { id: FF, name: 'Verdieping' },
  ],
  rooms: [],
  placements: [],
};
