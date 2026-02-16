import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Trophy,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import type { ViewType } from '@/types';

const navItems: { view: ViewType; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'employees', label: 'Employees', icon: Users },
  { view: 'projects', label: 'Projects', icon: Briefcase },
  { view: 'achievements', label: 'Achievements', icon: Trophy },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const { currentView, setView, company, resetGame } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!company) return null;

  const activeEmployees = company.employees.filter(e => !e.quitMonth).length;
  const activeProjects = company.projects.filter(p => p.status === 'inProgress').length;

  const handleNavClick = (view: ViewType) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="text-lg font-bold text-white truncate">{company.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
              <span>Month {company.currentMonth}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-zinc-400">Cash</p>
            <p className={`font-semibold ${company.cash >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${company.cash.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-zinc-400">Reputation</p>
            <p className="font-semibold text-yellow-400">{company.reputation}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <Button
              key={item.view}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleNavClick(item.view)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              
              {item.view === 'employees' && activeEmployees > 0 && (
                <Badge variant="secondary" className="ml-auto bg-zinc-700">
                  {activeEmployees}
                </Badge>
              )}
              
              {item.view === 'projects' && activeProjects > 0 && (
                <Badge variant="secondary" className="ml-auto bg-zinc-700">
                  {activeProjects}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/20"
          onClick={() => {
            if (confirm('Are you sure you want to start a new game?')) {
              resetGame();
            }
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>New Game</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-semibold text-white">{company.name}</span>
          </div>
          
          <div className="text-right">
            <p className={`font-semibold ${company.cash >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${company.cash.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800">
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </div>
    </>
  );
}
