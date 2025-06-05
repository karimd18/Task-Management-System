export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5096';

export const jsonHeaders = {
  'Content-Type': 'application/json',
};

export function handleErrors(res: Response, context = ''): void {
  if (!res.ok) {
    throw new Error(`Failed to ${context} (status ${res.status})`);
  }
}
