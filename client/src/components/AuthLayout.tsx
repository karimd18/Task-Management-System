import React from 'react';
import { AuthIcon, AuthIconType } from './AuthIcon';

interface AuthLayoutProps {
  mode: AuthIconType;
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ mode, title, children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <AuthIcon mode={mode} />
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
