import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import LoginPage from './admin/pages/LoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import IntakesPage from './admin/pages/IntakesPage';
import IntakeDetailPage from './admin/pages/IntakeDetailPage';
import CrmPage from './admin/pages/CrmPage';
import ContentPage from './admin/pages/ContentPage';
import ContentEditPage from './admin/pages/ContentEditPage';
import RapportagePage from './admin/pages/RapportagePage';
import InstellingenPage from './admin/pages/InstellingenPage';
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import DienstenPage from './pages/Diensten/DienstenPage';
import ResourcesPage from './pages/Resources/ResourcesPage';
import BlogDetailPage from './pages/Resources/BlogDetailPage';
import ContactPage from './pages/Contact/ContactPage';
import IntakePage from './pages/Intake/IntakePage';
import ScrollToTop from './components/ScrollToTop';
import StickyWhatsAppButton from './components/StickyWhatsAppButton';

function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="" element={<DashboardPage />} />
        <Route path="intakes" element={<IntakesPage />} />
        <Route path="intakes/:id" element={<IntakeDetailPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="content/:id" element={<ContentEditPage />} />
        <Route path="rapportage" element={<RapportagePage />} />
        <Route path="instellingen" element={<InstellingenPage />} />
      </Routes>
    </AdminLayout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/over-ons" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/diensten" element={<DienstenPage />} />
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:slug" element={<BlogDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminApp />
                </ProtectedRoute>
              }
            />
          </Routes>
          <StickyWhatsAppButton />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
