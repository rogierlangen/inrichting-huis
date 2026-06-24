import './App.css';
import { useHouseStore } from './store/useHouseStore';
import { RoomList } from './components/RoomList';
import { RoomCollage } from './components/RoomCollage';

function App() {
  const { floors, activeFloorId, setActiveFloor } = useHouseStore();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dorpstraat 60 — Inrichting</h1>
        <div className="floor-select">
          {floors.map((f) => (
            <button key={f.id} className={f.id === activeFloorId ? 'active' : ''} onClick={() => setActiveFloor(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
      </header>

      <main className="app-main">
        <RoomList />
        <div className="viewport">
          <RoomCollage />
        </div>
      </main>
    </div>
  );
}

export default App;
