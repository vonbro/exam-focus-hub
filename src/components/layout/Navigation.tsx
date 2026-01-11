import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText, Clock, Timer } from 'lucide-react';

const navItems = [
  { path: '/', label: 'PDF Exam', icon: FileText },
  { path: '/watch', label: 'Exam Watch', icon: Clock },
  { path: '/countdown', label: 'Countdown', icon: Timer },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground hidden sm:block">ExamPrep</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
