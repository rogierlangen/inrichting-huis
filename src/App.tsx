import { useState } from 'react';
import './App.css';
import { useHouseStore } from './store/useHouseStore';
import { FloorPlan2D } from './components/FloorPlan2D';
import { House3D } from './components/House3D';
import { FurniturePanel } from './components/FurniturePanel';

function App() {
  const { floors, activeFloorId, setActiveFloor } = useHouseStore();
  const [view, setView] = useState<'2d' | '3d'>('2d');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dorpstraat 60 — Inrichting</h1>
        <div className="view-toggle">
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>
            2D
          </button>
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>
            3D
          </button>
        </div>
        <div className="floor-select">
          {floors.map((f) => (
            <button key={f.id} className={f.id === activeFloorId ? 'active' : ''} onClick={() => setActiveFloor(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
      </header>

      <main className="app-main">
        <div className="viewport">{view === '2d' ? <FloorPlan2D /> : <House3D />}</div>
        <FurniturePanel />
      </main>
    </div>
  );
}

export default App;
