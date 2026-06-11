import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthenticatorRegister from './pages/AuthenticatorRegister';
import AuthenticatorLogin from './pages/AuthenticatorLogin';
import CodeDisplayPage from './pages/DisplayCodePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/register" element={<AuthenticatorRegister />} />
        <Route path="/login" element={<AuthenticatorLogin />} />
        <Route path="/code" element={<CodeDisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;