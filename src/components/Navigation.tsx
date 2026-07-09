import { Home, Users, User, Heart, MessageSquare } from 'lucide-react';
import { View } from '../types';
import { cn } from '../lib/utils';

interface Props {
  currentView: View;
  navigate: (view: View) => void;
}

export default function Navigation({ currentView, navigate }: Props) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rooms', label: 'Salas', icon: Users },
    { id: 'forum', label: 'Fórum', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: User },
  ] as const;

  return (
    <nav className="h-20 bg-[#020410]/95 backdrop-blur-md border-t border-white/5 px-6 pb-2 flex items-center justify-between z-10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
              isActive ? "text-purple-400" : "text-gray-400"
            )}
            id={`nav-tab-${tab.id}`}
          >
            <div className={cn(
              "p-1 rounded-xl transition-all duration-300",
              isActive && "bg-purple-500/10"
            )}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
