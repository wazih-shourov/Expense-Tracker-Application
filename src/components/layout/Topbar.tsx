
import { SidebarTrigger } from '@/components/ui/sidebar';
import Header from './Header';

interface TopbarProps {
  onSettingsClick?: () => void;
  onEditProfileClick?: () => void;
}

const Topbar = ({ onSettingsClick, onEditProfileClick }: TopbarProps) => {
  return (
    <div className="flex items-center border-b bg-background/80 backdrop-blur-sm border-border sticky top-0 z-40">
      {/* Desktop Sidebar Trigger - Hidden on mobile */}
      <div className="hidden md:block">
        <SidebarTrigger className="ml-4" />
      </div>
      
      <div className="flex-1">
        <Header 
          onSettingsClick={onSettingsClick}
          onEditProfileClick={onEditProfileClick}
        />
      </div>
    </div>
  );
};

export default Topbar;
