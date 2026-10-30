import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const LoginPage = () => {
  const { user, profile, loading, signIn, signInWithGoogle, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const destination = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && profile && !loading) navigate(destination, { replace: true });
  }, [destination, loading, navigate, profile, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">Loading...</div>;
  if (user && profile) return <Navigate to={destination} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setSubmitting(true);
    try { await signIn(form.email, form.password); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  const googleLogin = async () => {
    setError('');
    setSubmitting(true);
    try { await signInWithGoogle(); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to continue to your workspace.</p>
      {(error || authError) && <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error || authError}</div>}
      <button onClick={googleLogin} disabled={submitting} className="w-full h-11 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Continue with Google</button>
      <div className="flex items-center gap-3 my-5 text-xs text-slate-400"><span className="h-px bg-slate-200 flex-1" />or<span className="h-px bg-slate-200 flex-1" /></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Email<input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full h-11 px-3 border border-slate-300 rounded-lg" /></label>
        <label className="block text-sm font-medium text-slate-700">Password<div className="relative mt-1"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 px-3 pr-20 border border-slate-300 rounded-lg" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs text-brand-600">{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <button type="submit" disabled={submitting} className="w-full h-11 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50">{submitting ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="text-sm text-center text-slate-500 mt-6">New to ResolveOps? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
};
