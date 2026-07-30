import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { StoreProvider } from './store';
import { AuthScreen } from './screens/Auth';
import { CompanyOnboardingScreen } from './screens/CompanyOnboarding';
import { DashboardLayout } from './components/DashboardLayout';

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F2F2F7]">
      <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#007AFF] rounded-full animate-spin" />
    </div>
  );
}

function RootRouter() {
  const { user, loading: authLoading } = useAuth();
  const { activeCompany, loading: companyLoading } = useCompany();

  if (authLoading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;
  if (companyLoading) return <LoadingScreen />;
  if (!activeCompany) return <CompanyOnboardingScreen />;

  return (
    <StoreProvider>
      <DashboardLayout />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <RootRouter />
      </CompanyProvider>
    </AuthProvider>
  );
}
