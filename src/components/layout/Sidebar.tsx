
import { Home, Plus, Clock, Tag, Target, Settings } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar = ({ activePage, setActivePage }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-transaction', label: 'Add Transaction', icon: Plus },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'budget', label: 'Budget & Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">ET</span>
          </div>
          <span className="font-semibold text-gray-800">ExpenseTracker</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          + New Transaction
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
