import { Home, Plus, Clock, Tag, PiggyBank, TrendingUp, Settings, Target, Package, ShoppingCart, Users } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
interface AppSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}
export function AppSidebar({
  activePage,
  setActivePage
}: AppSidebarProps) {
  const menuItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home
  }, {
    id: 'add-transaction',
    label: 'Add Transaction',
    icon: Plus
  }, {
    id: 'history',
    label: 'History',
    icon: Clock
  }, {
    id: 'categories',
    label: 'Categories',
    icon: Tag
  }, {
    id: 'budget',
    label: 'Budget Planner',
    icon: Target
  }, {
    id: 'savings',
    label: 'Savings',
    icon: PiggyBank
  }, {
    id: 'health',
    label: 'Financial Health',
    icon: TrendingUp
  }, {
    id: 'inventory',
    label: 'Inventory Management',
    icon: Package
  }, {
    id: 'shopping',
    label: 'Shopping Planner',
    icon: ShoppingCart
  }, {
    id: 'social',
    label: 'Social',
    icon: Users
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];
  return <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            <img src="https://i.ibb.co/dsRgsNn4/Arti-Q-1.png" alt="Frinance Logo" className="w-full h-full object-cover" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-foreground text-base tracking-tight">Frinancce</span>
            <p className="text-xs text-muted-foreground font-medium">Financial Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80 tracking-wide uppercase px-3 mb-2">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => setActivePage(item.id)} isActive={isActive} tooltip={item.label} className={`
                        relative h-11 px-3 rounded-xl transition-all duration-200 ease-in-out
                        font-medium text-sm tracking-wide
                        hover:bg-accent/60 hover:text-accent-foreground
                        group-data-[collapsible=icon]:justify-center
                        ${isActive ? 'bg-accent text-accent-foreground shadow-sm border-l-2 border-l-blue-600' : 'text-muted-foreground hover:text-foreground'}
                      `}>
                      <Icon size={18} className={`
                          shrink-0 transition-colors duration-200
                          ${isActive ? 'text-blue-600' : 'text-current'}
                        `} />
                      <span className="ml-2 group-data-[collapsible=icon]:hidden font-medium tracking-wide">
                        {item.label}
                      </span>
                      {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-blue-600 rounded-full group-data-[collapsible=icon]:hidden" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 p-3">
        <Button onClick={() => setActivePage('add-transaction')} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium text-sm tracking-wide shadow-sm transition-all duration-200 ease-in-out hover:shadow-md group-data-[collapsible=icon]:px-0">
          <Plus size={18} className="shrink-0 group-data-[collapsible=icon]:mx-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden font-medium">New Transaction</span>
        </Button>
      </SidebarFooter>
    </Sidebar>;
}