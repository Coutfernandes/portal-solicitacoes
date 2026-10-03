import { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { getMe } from './services/api';

export function App() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('access_token'));
  });
  const [usuarioNome, setUsuarioNome] = useState('Usuário');

  useEffect(() => {
    if (!autenticado) return;

    let ativo = true;
    void getMe()
      .then((usuario) => {
        if (!ativo) return;
        const nomeCompleto = [usuario.first_name, usuario.last_name].filter(Boolean).join(' ');
        setUsuarioNome(nomeCompleto || usuario.username);
      })
      .catch((err: unknown) => {
        console.error('Erro ao carregar o utilizador autenticado:', err);
      });

    return () => {
      ativo = false;
    };
  }, [autenticado]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUsuarioNome('Usuário');
    setAutenticado(false);
  };

  return autenticado ? (
    <Dashboard onLogout={handleLogout} usuarioNome={usuarioNome} />
  ) : (
    <Login onLoginSuccess={() => setAutenticado(true)} />
  );
}

export default App;