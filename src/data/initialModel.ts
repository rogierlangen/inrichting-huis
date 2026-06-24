import type { HouseModel } from '../types/model';

// Greenfield start: geen geraden kamers/meubels. Upload per verdieping de echte
// plattegrond (knop "Plattegrond uploaden") — die afbeelding is de bron van waarheid.

const GF = 'begane-grond';
const FF = 'verdieping';

export const initialModel: HouseModel = {
  floors: [
    { id: GF, name: 'Begane grond', elevation: 0 },
    { id: FF, name: 'Verdieping', elevation: 2.8 },
  ],
  rooms: [],
  furniture: [],
  images: [],
};
