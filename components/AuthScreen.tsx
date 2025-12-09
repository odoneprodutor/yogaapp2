import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { Button } from './ui';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (mode === 'LOGIN') {
        user = await authService.login(email, password);
      } else {
        if (!name.trim()) throw new Error('Por favor, informe seu nome.');
        user = await authService.signup(name, email, password);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sage-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-sage-600" />
          </div>
          <h1 className="text-3xl font-light text-sage-900 mb-2">YogaFlow</h1>
          <p className="text-stone-500">
            {mode === 'LOGIN' ? 'Bem-vindo de volta ao seu centro.' : 'Comece sua jornada de equilíbrio hoje.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Nome</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:outline-none transition-all"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:outline-none transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'LOGIN' ? 'Entrar' : 'Criar Conta'} <ArrowRight size={18} />
              </>
            )}
          </Button>

          <div className="pt-4 text-center">
            <p className="text-stone-500 text-sm">
              {mode === 'LOGIN' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 font-medium text-sage-700 hover:text-sage-900 hover:underline transition-all"
              >
                {mode === 'LOGIN' ? 'Cadastre-se' : 'Faça Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};