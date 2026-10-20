import React from 'react';
import {
  LayoutDashboard,
  Wifi,
  Laptop2,
  Terminal,
  Settings,
} from 'lucide-react';
import { useRouterStore, type NavigationTab } from '../../store/useRouterStore';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, connectedDevices } = useRouterStore();

  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'wifi' as NavigationTab,
      label: 'Wi-Fi',
      icon: Wifi,
    },
    {
      id: 'devices' as NavigationTab,
      label: 'Clients',
      icon: Laptop2,
      badge: connectedDevices.length > 0 ? `${connectedDevices.length}` : null,
    },
    {
      id: 'terminal' as NavigationTab,
      label: 'Terminal',
      icon: Terminal,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Profiles',
      icon: Settings,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 relative transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400'} transition-transform`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
