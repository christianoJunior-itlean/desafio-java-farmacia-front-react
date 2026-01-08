// Importa React e hook de estado
import React, { useState } from 'react';

// Navegação e contexto de autenticação
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Serviço de autenticação e toasts
import { authService } from '../api/authService';
import { toast } from 'react-toastify';

// Logo e estilos da tela de login
import logo from '../logo.svg';
import './Login.css';

// Tela de Login/Cadastro (alternável)
export const Login: React.FC = () => {
  // Alterna entre modo login e cadastro
  const [isLogin, setIsLogin] = useState(true);
  // Campos de formulário
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  // Controle de carregamento do submit
  const [loading, setLoading] = useState(false);
  // Função de login do contexto
  const { login } = useAuth();
  // Hook para navegação pós-login
  const navigate = useNavigate();

  // Submete o formulário para login ou cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Fluxo de cadastro
    if (!isLogin) {
      if (senha !== confirmSenha) {
        toast.error('As senhas não coincidem');
        return;
      }
      if (senha.length < 6) {
        toast.error('A senha deve ter no mínimo 6 caracteres');
        return;
      }

      setLoading(true);
      try {
        await authService.registrar({ username, senha });
        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsLogin(true);
        setSenha('');
        setConfirmSenha('');
      } catch (error: any) {
        console.error('Erro no cadastro:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Erro ao realizar cadastro. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    // Fluxo de login
    try {
      await login({ username, senha });
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Usuário ou senha inválidos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Alterna entre modo login e cadastro, limpando campos
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setSenha('');
    setConfirmSenha('');
  };

  return (
    // Container da tela de login
    <div className="login-container">
      {/* Logos de fundo com leve animação/estilo */}
      <img src={logo} className="login-background-logo login-logo-left" alt="React Logo" />
      <img src={logo} className="login-background-logo login-logo-right" alt="React Logo" />
      {/* Card central com formulário */}
      <div className="login-card">
        <h1>Sistema de Farmácia</h1>
        <h2>{isLogin ? 'Login' : 'Cadastro'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Email</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmSenha">Confirmar Senha</label>
              <input
                type="password"
                id="confirmSenha"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                placeholder="********"
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>

          <div className="toggle-mode">
            <button type="button" className="btn-toggle" onClick={toggleMode}>
              {isLogin ? 'Criar uma conta' : 'Já tenho uma conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
