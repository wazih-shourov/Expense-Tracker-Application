
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Topbar from '@/components/layout/Topbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import DashboardMain from './DashboardMain';
import AddTransactionPage from '@/components/transactions/AddTransactionPage';
import HistoryPage from '@/components/transactions/HistoryPage';
import CategoriesPage from '@/components/categories/CategoriesPage';
import BudgetPlannerPage from '@/components/budget/BudgetPlannerPage';
import SavingsTrackerPage from '@/components/savings/SavingsTrackerPage';
import FinancialHealthPage from '@/components/health/FinancialHealthPage';
import SettingsPage from '@/components/settings/SettingsPage';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import ShoppingPlannerPage from '@/components/shopping/ShoppingPlannerPage';
import SocialFeedPage from '@/components/social/SocialFeedPage';
import ProfilePage from '@/components/social/ProfilePage';

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchParams] = useSearchParams();
  const profileUserId = searchParams.get('profileId');
  
  const handleSettingsClick = () => {
    setActivePage('settings');
  };

  const handleEditProfileClick = () => {
    setActivePage('settings');
  };
  
  const renderPage = () => {
    // If profileId query param exists, show profile page
    if (profileUserId) {
      return <ProfilePage userId={profileUserId} onBack={() => window.history.back()} />;
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardMain />;
      case 'add-transaction':
        return <AddTransactionPage onBack={() => setActivePage('dashboard')} />;
      case 'history':
        return <HistoryPage onBack={() => setActivePage('dashboard')} />;
      case 'categories':
        return <CategoriesPage onBack={() => setActivePage('dashboard')} />;
      case 'budget':
        return <BudgetPlannerPage onBack={() => setActivePage('dashboard')} />;
      case 'savings':
        return <SavingsTrackerPage onBack={() => setActivePage('dashboard')} />;
      case 'health':
        return <FinancialHealthPage onBack={() => setActivePage('dashboard')} />;
      case 'inventory':
        return <InventoryManagement />;
      case 'shopping':
        return <ShoppingPlannerPage />;
      case 'social':
        return <SocialFeedPage />;
      case 'settings':
        return <SettingsPage onBack={() => setActivePage('dashboard')} />;
      default:
        return <DashboardMain />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        
        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          <Topbar 
            onSettingsClick={handleSettingsClick}
            onEditProfileClick={handleEditProfileClick}
          />
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {renderPage()}
          </main>
        </SidebarInset>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
