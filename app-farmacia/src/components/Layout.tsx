import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.svg';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} className="navbar-logo" alt="React Logo" />
          <h1>Sistema de Farmácia</h1>
        </div>
        <div className="navbar-user">
          <span>Olá, {username}</span>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <ul className="menu">
            <li>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            </li>
            <li>
              <Link to="/medicamentos" className={isActive('/medicamentos')}>Medicamentos</Link>
            </li>
            <li>
              <Link to="/categorias" className={isActive('/categorias')}>Categorias</Link>
            </li>
            <li>
              <Link to="/clientes" className={isActive('/clientes')}>Clientes</Link>
            </li>
            <li>
              <Link to="/estoque" className={isActive('/estoque')}>Estoque</Link>
            </li>
            <li>
              <Link to="/vendas" className={isActive('/vendas')}>Vendas</Link>
            </li>
            <li>
              <Link to="/alertas" className={isActive('/alertas')}>Alertas</Link>
            </li>
          </ul>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};
