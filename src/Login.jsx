/**
 * Login.jsx — Phase 11
 * Real Firebase Email/Password authentication.
 */

import { useState }                           from 'react';
import { signInWithEmailAndPassword }         from 'firebase/auth';
import { auth }                               from './firebase';
import { Lock, Mail, Leaf }                   from 'lucide-react';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.jsx will catch the sign-in and render the dashboard
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'     ||
        err.code === 'auth/user-not-found'
          ? 'Incorrect email or password. Please try again.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please wait a moment and try again.'
            : 'Sign-in failed. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <Leaf size={36} style={{ margin: '0 auto 8px', color: 'var(--green)' }} />
          Stocks
        </div>
        <p className="login-tagline">Plywood &amp; Panels Register</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {error && (
            <div className="login-error" role="alert">{error}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
}
