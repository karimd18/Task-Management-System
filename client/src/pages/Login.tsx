import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';
import { AuthIconType } from '../components/AuthIcon';

type Mode = 'signin' | 'signup' | 'forgot';

const titles: Record<Mode, string> = {
  signin: 'Sign in to your account',
  signup: 'Create a new account',
  forgot: 'Reset your password',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signIn, signUp, forgotPassword } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [formState, setFormState] = useState({
    usernameOrEmail: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ pwd: false, confirm: false });

  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true });
    }
  }, [authLoading, user, from, navigate]);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const togglePasswordVisibility = (field: 'pwd' | 'confirm') => {
    setShowPwd(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSignIn = async () => {
    try {
      await signIn(formState.usernameOrEmail, formState.password);
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  const validateUsername = (name: string) => {
    if (name.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers & underscores';
    return null;
  };

  const handleSignUp = async () => {
    if (formState.password !== formState.confirmPassword) {
      return setError('Passwords do not match');
    }
    const unameErr = validateUsername(formState.username);
    if (unameErr) return setError(unameErr);

    try {
      await signUp(
        formState.email,
        formState.username,
        formState.password,
        formState.confirmPassword
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleForgot = async () => {
    try {
      await forgotPassword(formState.email);
      setError('Check your email for the reset link');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStepLoading(true);
    try {
      if (mode === 'signin') await handleSignIn();
      else if (mode === 'signup') await handleSignUp();
      else if (mode === 'forgot') await handleForgot();
      if (!error && mode === 'signin') {
        // on successful sign-in, navigate
        navigate(from, { replace: true });
      }
    } finally {
      setStepLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (mode) {
      case 'signin':
        return (
          <>
            <div>
              <label
                htmlFor="signin-user"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username or Email
              </label>
              <input
                id="signin-user"
                type="text"
                value={formState.usernameOrEmail}
                onChange={e => handleChange('usernameOrEmail', e.target.value)}
                required
                disabled={stepLoading || authLoading}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                           focus:ring-indigo-500 focus:border-indigo-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPwd.pwd ? 'text' : 'password'}
                  value={formState.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                  disabled={stepLoading || authLoading}
                  className="block w-full px-3 py-2 border rounded-md shadow-sm
                             focus:ring-indigo-500 focus:border-indigo-500
                             dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('pwd')}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400
                             hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPwd.pwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </>
        );

      case 'signup':
        return (
          <>
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={formState.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                disabled={stepLoading || authLoading}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                           focus:ring-indigo-500 focus:border-indigo-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="signup-username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                value={formState.username}
                onChange={e => handleChange('username', e.target.value)}
                required
                disabled={stepLoading || authLoading}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                           focus:ring-indigo-500 focus:border-indigo-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Letters, numbers & underscores only
              </p>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPwd.pwd ? 'text' : 'password'}
                  value={formState.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                  disabled={stepLoading || authLoading}
                  className="block w-full px-3 py-2 border rounded-md shadow-sm
                             focus:ring-indigo-500 focus:border-indigo-500
                             dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('pwd')}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400
                             hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPwd.pwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirm-password"
                  type={showPwd.confirm ? 'text' : 'password'}
                  value={formState.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={stepLoading || authLoading}
                  className="block w-full px-3 py-2 border rounded-md shadow-sm
                             focus:ring-indigo-500 focus:border-indigo-500
                             dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400
                             hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPwd.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </>
        );

      case 'forgot':
        return (
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={formState.email}
              onChange={e => handleChange('email', e.target.value)}
              required
              disabled={stepLoading || authLoading}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                         focus:ring-indigo-500 focus:border-indigo-500
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        );
    }
  };

  return (
    <AuthLayout mode={mode as AuthIconType} title={titles[mode]}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFormFields()}

        {error && (
          <p
            className={`text-sm text-center ${
              error.includes('Check') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={stepLoading || authLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm
                     text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {stepLoading || authLoading
            ? 'Please wait...'
            : { signin: 'Sign In', signup: 'Sign Up', forgot: 'Send Reset Link' }[mode]}
        </button>
      </form>

      <div className="mt-6 text-center">
        {mode === 'signin' ? (
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm"
            >
              Forgot password?
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setFormState({ usernameOrEmail: '', email: '', username: '', password: '', confirmPassword: '' });
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm"
          >
            Back to sign in
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
