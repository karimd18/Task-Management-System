import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';

const validateUsername = (name: string) => {
  if (name.length < 3) return 'Username must be at least 3 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers & underscores';
  return null;
};

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState({ pwd: false, conf: false });

  const from = (location.state as any)?.from?.pathname || '/';
  useEffect(() => { if (!authLoading && user) navigate(from, { replace: true }); }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (password !== confirm) return setError('Passwords do not match');
    const unameErr = validateUsername(username);
    if (unameErr) return setError(unameErr);
    try {
      await signUp(email, username, password, confirm);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout mode="signup" title="Create a new account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input id="email" type="email" value={email}
            onChange={e=>setEmail(e.target.value)} required disabled={authLoading}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500"/>
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input id="username" value={username}
            onChange={e=>setUsername(e.target.value)} required disabled={authLoading}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500"/>
          <p className="text-sm text-gray-500">Letters, numbers & underscores only</p>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative mt-1">
            <input id="password" type={showPwd.pwd ? 'text' : 'password'} value={password}
              onChange={e=>setPassword(e.target.value)} required disabled={authLoading}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500"/>
            <button type="button" className="absolute right-3 top-2.5" onClick={()=>setShowPwd(p=>({...p, pwd:!p.pwd}))}>
              {showPwd.pwd ? <EyeOff size={20}/> : <Eye size={20}/>}'
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
          <div className="relative mt-1">
            <input id="confirm" type={showPwd.conf ? 'text' : 'password'} value={confirm}
              onChange={e=>setConfirm(e.target.value)} required disabled={authLoading}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500"/>
            <button type="button" className="absolute right-3 top-2.5" onClick={()=>setShowPwd(p=>({...p, conf:!p.conf}))}>
              {showPwd.conf ? <EyeOff size={20}/> : <Eye size={20}/>}'
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <button type="submit" disabled={authLoading}
          className="w-full py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">
          {authLoading ? 'Please wait...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/auth/signin" className="text-indigo-600 hover:underline">Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}