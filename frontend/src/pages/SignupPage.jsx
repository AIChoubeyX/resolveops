import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const SignupPage = () => {
  const { user, profile, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">Loading...</div>;
  if (user && profile) return <Navigate to="/" replace />;
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email || !form.password) return setError('Complete all required fields.');
    if (form.password.length < 6) return setError('Use a password with at least six characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setSubmitting(true); setError('');
    try { await signUp(form.email, form.password, form.name); navigate('/'); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };
  const googleSignup = async () => { setSubmitting(true); setError(''); try { await signInWithGoogle(); navigate('/'); } catch (err) { setError(err.message); } finally { setSubmitting(false); } };
  return (
    <AuthLayout>
      <h1 className="text-xl font-bold text-slate-900">Create your workspace</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Start organizing support and incidents with ResolveOps.</p>
      {error && <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
      <button onClick={googleSignup} disabled={submitting} className="w-full h-11 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Sign up with Google</button>
      <div className="flex items-center gap-3 my-5 text-xs text-slate-400"><span className="h-px bg-slate-200 flex-1" />or<span className="h-px bg-slate-200 flex-1" /></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-11 px-3 border border-slate-300 rounded-lg" /></label>
        <label className="block text-sm font-medium text-slate-700">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full h-11 px-3 border border-slate-300 rounded-lg" /></label>
        <label className="block text-sm font-medium text-slate-700">Password<div className="relative mt-1"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 px-3 pr-20 border border-slate-300 rounded-lg" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs text-brand-600">{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <label className="block text-sm font-medium text-slate-700">Confirm password<input type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="mt-1 w-full h-11 px-3 border border-slate-300 rounded-lg" /></label>
        <button type="submit" disabled={submitting} className="w-full h-11 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50">{submitting ? 'Creating workspace...' : 'Create account'}</button>
      </form>
      <p className="text-sm text-center text-slate-500 mt-6">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></p>
    </AuthLayout>
  );
};
