import React, { useState } from 'react';
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
        <button 
          className="hamburger-button" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
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
        {isMobileMenuOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={closeMobileMenu}
          ></div>
        )}

        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="menu">
            <li>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeMobileMenu}>Dashboard</Link>
            </li>
            <li>
              <Link to="/medicamentos" className={isActive('/medicamentos')} onClick={closeMobileMenu}>Medicamentos</Link>
            </li>
            <li>
              <Link to="/categorias" className={isActive('/categorias')} onClick={closeMobileMenu}>Categorias</Link>
            </li>
            <li>
              <Link to="/clientes" className={isActive('/clientes')} onClick={closeMobileMenu}>Clientes</Link>
            </li>
            <li>
              <Link to="/estoque" className={isActive('/estoque')} onClick={closeMobileMenu}>Estoque</Link>
            </li>
            <li>
              <Link to="/vendas" className={isActive('/vendas')} onClick={closeMobileMenu}>Vendas</Link>
            </li>
            <li>
              <Link to="/alertas" className={isActive('/alertas')} onClick={closeMobileMenu}>Alertas</Link>
            </li>
          </ul>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};
