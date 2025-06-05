import React from 'react';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

export type AuthIconType = 'signin' | 'signup' | 'forgot' | 'reset';

export const AuthIcon: React.FC<{ mode: AuthIconType }> = ({ mode }) => {
  const cls = 'h-12 w-12 text-indigo-600 dark:text-indigo-400';
  switch (mode) {
    case 'signin': return <LogIn className={cls} />;
    case 'signup': return <UserPlus className={cls} />;
    default: return <KeyRound className={cls} />;
  }
};