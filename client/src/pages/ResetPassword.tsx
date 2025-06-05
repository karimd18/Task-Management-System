import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { resetPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState({ new: false, confirm: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      return setError('Invalid or missing reset token.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords must match.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    try {
      await resetPassword(token, newPassword, confirmPassword);
      navigate('/auth/signin');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout mode="reset" title="Set new password">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative mt-1">
            <input
              id="new-password"
              type={showPwd.new ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              disabled={authLoading}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
            >
              {showPwd.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <input
              id="confirm-password"
              type={showPwd.confirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={authLoading}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
            >
              {showPwd.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {authLoading ? 'Please wait...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/auth/signin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
