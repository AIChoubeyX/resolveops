import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { TicketsPage } from '../pages/TicketsPage.jsx';
import { TicketDetailPage } from '../pages/TicketDetailPage.jsx';
import { KnowledgeBasePage } from '../pages/KnowledgeBasePage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { SignupPage } from '../pages/SignupPage.jsx';
import { InvitationPage } from '../pages/InvitationPage.jsx';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx';

/**
 * Main application routing configuration.
 * All core views share the standard AppLayout.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/invite/:token" element={<InvitationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          {/* / : Dashboard Overview */}
          <Route index element={<DashboardPage />} />

          {/* /tickets : Ticket Inbox */}
          <Route path="tickets" element={<TicketsPage />} />

          {/* /tickets/:ticketId : Ticket Detail */}
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />

          {/* /knowledge : Knowledge-Base Placeholder */}
          <Route path="knowledge" element={<KnowledgeBasePage />} />

          {/* /settings : Settings Placeholder */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
