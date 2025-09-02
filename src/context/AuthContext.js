import { createContext, useContext, useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

const AuthContext = createContext();
const SECRET_KEY = 'clave-super-secreta';

const USUARIOS = [
  { usuario: 'admin', password: 'admin123', rol: 'admin' },
  { usuario: 'cliente', password: 'cliente123', rol: 'cliente' },
];

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState('');
  const [rol, setRol] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('authToken');
      if (saved) {
        const decoded = jwt.verify(saved, SECRET_KEY);
        if (decoded?.usuario && decoded?.rol) {
          setUsuario(decoded.usuario);
          setRol(decoded.rol);
          setToken(saved);
        }
      }
    } catch {
      localStorage.removeItem('authToken');
    }
  }, []);

  const login = (u, p) => {
    const match = USUARIOS.find(user => user.usuario === u && user.password === p);
    if (match) {
      const newToken = jwt.sign({ usuario: match.usuario, rol: match.rol }, SECRET_KEY);
      setUsuario(match.usuario);
      setRol(match.rol);
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
    } else {
      alert('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUsuario('');
    setRol('');
    setToken('');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ usuario, rol, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
