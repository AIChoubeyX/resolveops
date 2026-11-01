import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { acceptInvitation } from '../services/api.js';

export const InvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading, refreshProfile } = useAuth();
  const [state, setState] = useState({ loading: false, error: '', success: '' });
  const acceptedInvitation = useRef('');

  const accept = async () => {
    const requestKey = `${user.uid}:${token}`;
    if (acceptedInvitation.current === requestKey) return;
    acceptedInvitation.current = requestKey;
    setState({ loading: true, error: '', success: '' });
    try {
      const result = await acceptInvitation(token, user);
      await refreshProfile();
      setState({ loading: false, error: '', success: `You joined ${result.organization.name}.` });
    } catch (error) {
      acceptedInvitation.current = '';
      setState({ loading: false, error: error.message, success: '' });
    }
  };
  useEffect(() => { if (user && !loading) accept(); }, [user, loading, token]);
  if (!loading && !user) return <Navigate to="/login" replace state={{ from: `/invite/${token}` }} />;

  return <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4"><div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4"><h1 className="text-xl font-bold text-slate-900">Workspace invitation</h1>{state.loading || loading ? <p className="text-sm text-slate-500">Validating invitation...</p> : state.error ? <p className="text-sm text-rose-700">{state.error}</p> : <p className="text-sm text-emerald-700">{state.success}</p>}{state.success && <Button onClick={() => navigate('/')}>Open workspace</Button>}</div></div>;
};
