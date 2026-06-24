import type { HouseModel, Room } from '../types/model';

// Geschatte afmetingen, afgeleid van de Funda-plattegronden.
// Pas de exacte maten aan in de 2D-editor met de plattegrond als achtergrond.

const GF = 'begane-grond';
const FF = 'verdieping';

function rect(id: string, name: string, floorId: string, x: number, y: number, w: number, d: number, height: number, color: string): Room {
  return {
    id,
    name,
    floorId,
    wallHeight: height,
    color,
    points: [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + d },
      { x, y: y + d },
    ],
  };
}

const rooms: Room[] = [
  // Begane grond
  rect('entree', 'Entree', GF, 0, 0, 1.5, 2.6, 2.6, '#f6d98a'),
  rect('voorkamer', 'Voorkamer', GF, 1.5, 0, 3.5, 2.6, 2.6, '#f3c98f'),
  rect('woonkamer', 'Woonkamer', GF, 0, 2.6, 5.0, 4.5, 2.7, '#f0d6a8'),
  rect('eetkamer', 'Eetkamer', GF, -2.8, 7.1, 2.8, 3.0, 3.0, '#efd9a8'),
  rect('keuken', 'Keuken', GF, 0, 7.1, 2.2, 3.0, 2.4, '#cfe0ef'),
  rect('bijkeuken', 'Bijkeuken', GF, 2.2, 7.1, 1.4, 1.6, 2.4, '#e3e3e3'),
  rect('berging-1', 'Berging', GF, 3.6, 7.1, 1.4, 1.6, 2.2, '#d8cdb8'),
  rect('overkapping', 'Overkapping', GF, 1.4, 10.1, 3.0, 2.0, 2.1, '#dcdcdc'),
  rect('multifunctioneel', 'Multifunctionele ruimte', GF, 0, 12.1, 5.0, 5.0, 2.2, '#f1e4c2'),
  rect('berging-2', 'Berging', GF, 0.5, 17.1, 3.0, 2.5, 2.3, '#d8cdb8'),

  // Verdieping
  rect('slaapkamer-1', 'Slaapkamer', FF, 0, 0, 2.6, 3.1, 2.5, '#cfe8d8'),
  rect('slaapkamer-2', 'Slaapkamer', FF, 2.6, 0, 2.4, 3.1, 2.5, '#cfe8d8'),
  rect('badkamer', 'Badkamer', FF, 0, 3.1, 2.0, 2.0, 2.4, '#cfe0ef'),
  rect('overloop', 'Overloop', FF, 2.0, 3.1, 1.4, 2.0, 2.4, '#e3e3e3'),
  rect('berging-zolder', 'Berging', FF, 3.4, 3.1, 1.6, 2.0, 2.2, '#d8cdb8'),
  rect('slaapkamer-3', 'Slaapkamer', FF, 0, 5.1, 2.6, 3.0, 2.5, '#cfe8d8'),
  rect('slaapkamer-4', 'Slaapkamer', FF, 2.6, 5.1, 2.4, 3.0, 2.5, '#cfe8d8'),
  rect('zolder', 'Zolder', FF, 0.5, 9.0, 5.0, 6.0, 2.9, '#f1e4c2'),
];

export const initialModel: HouseModel = {
  floors: [
    { id: GF, name: 'Begane grond', elevation: 0 },
    { id: FF, name: 'Verdieping', elevation: 2.8 },
  ],
  rooms,
  furniture: [],
  images: [],
};
