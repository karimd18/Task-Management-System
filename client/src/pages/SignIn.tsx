import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';
  useEffect(() => { if (!authLoading && user) navigate(from, { replace: true }); }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try { await signIn(usernameOrEmail, password); }
    catch { setError('Invalid credentials.'); }
  };

  return (
    <AuthLayout mode="signin" title="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username or Email
          </label>
          <input
            id="username" type="text" value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            required disabled={authLoading}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password" type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              required disabled={authLoading}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
            <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowPwd(p => !p)}>
              {showPwd ? <EyeOff size={20}/> : <Eye size={20}/>}'
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
        <button type="submit" disabled={authLoading}
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:ring focus:ring-indigo-500 disabled:opacity-50">
          {authLoading ? 'Please wait...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-6 text-center flex justify-between">
        <Link to="/auth/signup" className="text-indigo-600 hover:underline">Create account</Link>
        <Link to="/auth/forgot" className="text-indigo-600 hover:underline">Forgot password?</Link>
      </div>
    </AuthLayout>
  );
}