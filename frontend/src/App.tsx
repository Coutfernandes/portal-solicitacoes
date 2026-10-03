import { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('@Portal:token'));
  });

  const handleLogout = () => {
    localStorage.removeItem('@Portal:token');
    setAutenticado(false);
  };

  return autenticado ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={() => setAutenticado(true)} />
  );
}

export default App;