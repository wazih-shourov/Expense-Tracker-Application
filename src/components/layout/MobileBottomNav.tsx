
import { Home, Plus, Clock, Tag, TrendingUp, Target, PiggyBank, Package, ShoppingCart, Users } from 'lucide-react';

interface MobileBottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const MobileBottomNav = ({ activePage, setActivePage }: MobileBottomNavProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'add-transaction', label: 'Add', icon: Plus },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'health', label: 'Health', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'social', label: 'Social', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center py-2 px-2 gap-1" style={{ width: 'max-content' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 whitespace-nowrap min-w-[70px] flex-shrink-0 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
