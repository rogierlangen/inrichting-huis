import type { HouseModel, Room } from '../types/model';

// Maten afgeleid van de Funda-plattegronden met maatvoering (begane grond + verdieping).
// x = links->rechts, y = voorgevel (straat, y=0) -> achtergevel (tuin, y groot).
// Sommige hoeken/nisjes zijn vereenvoudigd tot rechte hoeken; pas zo nodig verder
// fijn aan via de 2D-editor met de plattegrond als achtergrond.

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

function poly(id: string, name: string, floorId: string, points: { x: number; y: number }[], height: number, color: string): Room {
  return { id, name, floorId, wallHeight: height, color, points };
}

const rooms: Room[] = [
  // ---- Begane grond ----
  rect('voorkamer', 'Voorkamer', GF, 0, 0, 4.6, 2.6, 2.58, '#f3c98f'),
  rect('entree', 'Entree', GF, 4.6, 0, 2.4, 2.6, 2.58, '#f6d98a'),

  rect('woonkamer', 'Woonkamer', GF, 0, 2.6, 7.0, 4.6, 2.7, '#f0d6a8'),
  rect('bedstede', 'Bedstede', GF, 6.2, 2.6, 0.8, 1.3, 2.4, '#e3d8c2'),

  rect('keuken', 'Keuken', GF, 0, 7.2, 3.0, 3.0, 2.59, '#cfe0ef'),
  rect('hal', 'Hal / trap', GF, 3.0, 7.2, 2.0, 3.0, 2.6, '#e8e8e8'),
  rect('bijkeuken', 'Bijkeuken', GF, 5.0, 7.2, 2.4, 1.5, 2.4, '#e3e3e3'),
  rect('eetkamer', 'Eetkamer', GF, 5.0, 8.7, 2.4, 2.0, 3.03, '#efd9a8'),
  rect('berging-1', 'Berging', GF, 7.4, 7.2, 1.4, 3.5, 2.71, '#d8cdb8'),

  rect('overkapping', 'Overkapping', GF, 3.0, 10.7, 3.5, 2.3, 2.17, '#dcdcdc'),

  rect('multifunctioneel', 'Multifunctionele ruimte', GF, 0, 13.0, 6.24, 3.8, 2.29, '#f1e4c2'),
  rect('kast-mf', 'Kast', GF, 6.24, 13.0, 1.5, 1.5, 2.3, '#e3d8c2'),
  rect('berging-2', 'Berging', GF, 6.24, 14.5, 1.5, 2.3, 2.7, '#d8cdb8'),

  poly(
    'berging-zolder-gf',
    'Berging',
    GF,
    [
      { x: 0.8, y: 16.8 },
      { x: 7.0, y: 16.8 },
      { x: 7.74, y: 17.5 },
      { x: 7.74, y: 19.5 },
      { x: 0.8, y: 19.5 },
    ],
    2.09,
    '#d8cdb8',
  ),

  // ---- Verdieping ----
  rect('badkamer', 'Badkamer', FF, 0, 0, 2.0, 1.8, 2.4, '#cfe0ef'),
  rect('inloopkast', 'Inloopkast', FF, 2.0, 0, 1.5, 1.8, 2.4, '#e3d8c2'),
  rect('slaapkamer-1', 'Slaapkamer', FF, 3.5, 0, 3.9, 3.4, 1.75, '#cfe8d8'),

  rect('slaapkamer-2', 'Slaapkamer', FF, 0, 1.8, 2.6, 3.2, 2.5, '#cfe8d8'),
  rect('overloop', 'Overloop', FF, 2.6, 1.8, 1.6, 3.2, 2.4, '#e3e3e3'),
  rect('berging-zolder', 'Berging', FF, 4.2, 1.8, 1.4, 1.8, 2.2, '#d8cdb8'),
  rect('badkamer-2', 'Badkamer', FF, 4.2, 3.6, 1.4, 1.4, 2.4, '#cfe0ef'),

  rect('slaapkamer-3', 'Slaapkamer', FF, 0, 5.0, 2.6, 3.4, 2.5, '#cfe8d8'),
  rect('slaapkamer-4', 'Slaapkamer', FF, 2.6, 5.0, 1.6, 3.4, 2.5, '#cfe8d8'),
  rect('slaapkamer-5', 'Slaapkamer', FF, 4.2, 5.0, 1.4, 3.4, 2.5, '#cfe8d8'),

  rect('zolder', 'Zolder', FF, 1.0, 8.4, 5.0, 6.3, 2.94, '#f1e4c2'),
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
