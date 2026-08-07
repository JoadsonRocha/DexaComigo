import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && !name) return;

    setLoading(true);
    setErrorMsg('');
    try {
      if (isRegistering) {
        await register(email, password, name, role);
        alert('Cadastro realizado com sucesso! Verifique seu e-mail se necessário.');
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      
      let friendlyError = 'Erro ao realizar a operação. Verifique as credenciais.';
      const rawError = error.message?.toLowerCase() || '';

      if (rawError.includes('invalid login credentials')) {
          friendlyError = 'E-mail ou senha incorretos.';
      } else if (rawError.includes('user already registered')) {
          friendlyError = 'Este e-mail já está em uso por outra conta.';
      } else if (rawError.includes('password should be at least 6 characters')) {
          friendlyError = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (rawError.includes('rate limit')) {
          friendlyError = 'Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.';
      } else if (rawError.includes('invalid email')) {
          friendlyError = 'Formato de e-mail inválido.';
      }
      
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">+B Mais Beleza</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {errorMsg}
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">O que você deseja?</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex justify-center px-4 py-3 border rounded-md cursor-pointer transition-colors ${role === UserRole.CLIENT ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                      <input type="radio" name="role" value={UserRole.CLIENT} className="sr-only" checked={role === UserRole.CLIENT} onChange={() => setRole(UserRole.CLIENT)} />
                      <span className="text-sm font-medium text-center">Contratar Serviços</span>
                    </label>
                    <label className={`flex-1 flex justify-center px-4 py-3 border rounded-md cursor-pointer transition-colors ${role === UserRole.PROVIDER ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                      <input type="radio" name="role" value={UserRole.PROVIDER} className="sr-only" checked={role === UserRole.PROVIDER} onChange={() => setRole(UserRole.PROVIDER)} />
                      <span className="text-sm font-medium text-center">Oferecer Serviços</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={isRegistering}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {loading ? 'Aguarde...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                className="text-sm text-brand-600 font-medium hover:underline"
             >
                {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
