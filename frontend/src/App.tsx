import { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('access_token'));
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAutenticado(false);
  };

  return autenticado ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={() => setAutenticado(true)} />
  );
}

export default App;