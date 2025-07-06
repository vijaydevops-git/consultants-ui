import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { SubmissionList } from './components/submissions/SubmissionList';
import { AddSubmissionForm } from './components/submissions/AddSubmissionForm';
import { ConsultantList } from './components/consultants/ConsultantList';
import { CompanyList } from './components/companies/CompanyList';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'submissions':
        return <SubmissionList />;
      case 'add-submission':
        return <AddSubmissionForm />;
      case 'consultants':
        return user.role === 'admin' ? <ConsultantList /> : null;
      case 'companies':
        return user.role === 'admin' ? <CompanyList /> : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;