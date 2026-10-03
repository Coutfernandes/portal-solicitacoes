import React, { useState } from 'react';
import { api, registerUser } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      onLoginSuccess();
    } catch {
      setError('Credenciais inválidas. Verifique o usuário e a senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerUser({
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
      });
      setSuccess('Usuário cadastrado com sucesso! Faça login abaixo.');
      setIsRegistering(false);
      setPassword('');
    } catch {
      setError('Erro ao cadastrar usuário. Verifique se o nome de usuário já existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'sans-serif' }}>
      {/* Painel Esquerdo Azul-Marinho */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Portal Interno</h3>
        </div>

        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            Registre demandas.
            <br />
            Acompanhe até a conclusão.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
            TI, RH, Compras, Financeiro e Infraestrutura em um só lugar.
          </p>
        </div>

        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          © 2026 Portal de Solicitações Internas
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {isRegistering
              ? 'Preencha os dados abaixo para se cadastrar.'
              : 'Use suas credenciais corporativas.'}
          </p>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '0.3rem' }}>
                Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {isRegistering && (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '0.3rem' }}>
                      Nome
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '0.3rem' }}>
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '0.3rem' }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '0.3rem' }}>
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              {loading
                ? 'Aguarde...'
                : isRegistering
                ? 'Cadastrar'
                : '→ Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isRegistering
                ? 'Já possui uma conta? Faça login'
                : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};