import axios from 'axios';
import { FirebaseError } from 'firebase/app';

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail =
      typeof error.response?.data === 'object' && error.response?.data !== null
        ? (error.response.data as { detail?: string }).detail
        : undefined;

    if (status === 401) {
      return (
        detail ||
        'Server could not verify your sign-in. Ensure the Django backend has a valid Firebase service account JSON configured.'
      );
    }
    if (status === 403) {
      return detail || 'You are not allowed to access this account.';
    }
    if (status === 404) {
      return 'Backend API not found. Set NEXT_PUBLIC_API_URL to http://localhost:8000/api and ensure Django is running.';
    }
    if (!error.response) {
      return 'Cannot reach the backend API. Start Django on port 8000, then try again.';
    }
    return detail || `Server error (${status}). Please try again.`;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Allow pop-ups for this site and try again.';
      case 'auth/unauthorized-domain':
        return 'This site is not authorized in Firebase. Add localhost to Authentication → Settings → Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is disabled in Firebase. Enable Email/Password or Google under Authentication → Sign-in method.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Wait a moment and try again.';
      case 'auth/invalid-api-key':
      case 'auth/app-not-authorized':
        return 'Invalid Firebase configuration. Check frontend/.env.local matches your Firebase web app settings.';
      default:
        return error.message || 'Authentication failed. Please try again.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Missing Firebase env')) {
      return 'Firebase is not configured. Copy frontend/.env.example to .env.local and add your project keys.';
    }
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
