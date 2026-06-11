/*
 * Program: App.jsx
 *
 * Purpose: Defines the route structure for the Secure Authenticator React
 *          application. The app supports setup, login, and current-code views.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthenticatorRegister from './pages/AuthenticatorRegister';
import AuthenticatorLogin from './pages/AuthenticatorLogin';
import CodeDisplayPage from './pages/DisplayCodePage';

/*
 * Component: App
 *
 * Purpose: Maps authenticator URLs to their corresponding page components.
 */
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
