import React, { useState } from 'react';
import { login } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !pw.trim()) {
      setError('Por favor, ingresa tus credenciales');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login({ user: usuario, pw: pw });
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🚀</div>
          <h1>Bienvenido</h1>
          <p>Plataforma de Subida de Videos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Nombre de usuario"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pw">Contraseña</label>
            <input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Acceso restringido para administradores</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
