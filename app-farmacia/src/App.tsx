import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Categorias } from './pages/Categorias';
import { Medicamentos } from './pages/Medicamentos';
import { Clientes } from './pages/Clientes';
import { EstoquePage } from './pages/EstoquePage';
import { Vendas } from './pages/Vendas';
import { Alertas } from './pages/Alertas';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <PrivateRoute>
                <Categorias />
              </PrivateRoute>
            }
          />
          <Route
            path="/medicamentos"
            element={
              <PrivateRoute>
                <Medicamentos />
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Clientes />
              </PrivateRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <PrivateRoute>
                <EstoquePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendas"
            element={
              <PrivateRoute>
                <Vendas />
              </PrivateRoute>
            }
          />
          <Route
            path="/alertas"
            element={
              <PrivateRoute>
                <Alertas />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
