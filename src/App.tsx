import { RailwaySystem } from './components/Railway';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Sistema de Control Ferroviario</h1>
      </header>
      <main className="app-main">
        <RailwaySystem />
      </main>
    </div>
  );
}

export default App;
