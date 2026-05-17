import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Authenticate from './pages/Authenticate';
import Game from './pages/Game';
import Admin from './pages/Admin';
import Login from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/authenticate" element={<Authenticate />} />
        <Route path="/game" element={<Game />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;