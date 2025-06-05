import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { forgotPassword, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      await forgotPassword(email);
      setMessage('Check your email for the reset token');
    } catch (err:any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout mode="forgot" title="Reset your password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input id="email" type="email" value={email}
            onChange={e=>setEmail(e.target.value)} required disabled={authLoading}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500"/>
        </div>
        {(error || message) && <p className={`text-sm text-center ${error?'text-red-600':'text-green-600'}`}>{error||message}</p>}
        <button type="submit" disabled={authLoading}
          className="w-full py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">
          {authLoading ? 'Please wait...' : 'Send Reset Token'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/auth/signin" className="text-indigo-600 hover:underline">Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}