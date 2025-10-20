import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ListaPacientes from './pages/pacientes/listaPacientes';
import Home from './pages/home/home';
import HistorialPage from './pages/fichasMedicas/HistorialPage';
import TratamientosPacientePage from './pages/fichasMedicas/TratamientosPacientePage';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link to="/">Home</Link>
            <Link to="/pacientes">Pacientes</Link>
            <Link to="/historial">Fichas Medicas</Link>
          </nav>
        </header>

        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pacientes" element={<ListaPacientes />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/historial/paciente/:id" element={<TratamientosPacientePage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;