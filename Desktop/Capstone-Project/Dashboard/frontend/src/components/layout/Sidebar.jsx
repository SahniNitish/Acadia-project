import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useBadgeCounts } from '../../hooks/useBadgeCounts';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Footprints,
  Bus,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/alerts',    icon: Bell,            label: 'Alerts',     badgeKey: 'alerts' },
  { path: '/incidents', icon: FileText,         label: 'Incidents',  badgeKey: 'incidents' },
  { path: '/escorts',   icon: Footprints,       label: 'Escorts',    badgeKey: 'escorts' },
  { path: '/shuttles',  icon: Bus,              label: 'Shuttles',   badgeKey: 'shuttles' },
  { path: '/broadcast', icon: Megaphone,        label: 'Broadcast' },
  { path: '/analytics', icon: BarChart3,        label: 'Analytics' },
  { path: '/users',     icon: Users,            label: 'Users' },
  { path: '/settings',  icon: Settings,         label: 'Settings' },
];

const BadgePill = ({ count }) => {
  if (!count) return null;
  return (
    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const BadgeDot = ({ count }) => {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { userData, logout } = useAuth();
  const badgeCounts = useBadgeCounts();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name) => {
    if (!name) return 'SO';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#0d1b2a] text-white flex flex-col z-40 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-[#1b263b]">
          <div className="w-10 h-10 rounded-lg bg-[#1b263b] flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg whitespace-nowrap">Acadia Safe</h1>
              <p className="text-xs text-slate-400 whitespace-nowrap">Security Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

              const linkContent = (
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#1b263b] text-white border-l-4 border-l-[#3182ce] -ml-1 pl-4'
                      : 'text-slate-300 hover:bg-[#1b263b] hover:text-white'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {/* Icon with collapsed badge */}
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#3182ce]' : ''}`} />
                    {collapsed && <BadgeDot count={count} />}
                  </div>

                  {/* Label + expanded badge */}
                  {!collapsed && (
                    <>
                      <span className={`whitespace-nowrap flex-1 ${isActive ? 'font-medium' : ''}`}>
                        {item.label}
                      </span>
                      <BadgePill count={count} />
                    </>
                  )}
                </NavLink>
              );

              return (
                <li key={item.path}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1b263b] text-white border-[#415a77]">
                        {item.label}{count ? ` (${count})` : ''}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Collapse Toggle */}
        <div className="border-t border-[#1b263b] p-3">
          {/* User Info */}
          <div className={`flex items-center gap-3 mb-3 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="w-10 h-10 border-2 border-[#415a77]">
              <AvatarFallback className="bg-[#1b263b] text-white text-sm font-medium">
                {getInitials(userData?.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userData?.name || 'Officer'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="text-xs text-slate-400 capitalize">{userData?.role || 'Officer'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex ${collapsed ? 'flex-col gap-2' : 'gap-2'}`}>
            {collapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="w-full text-slate-400 hover:text-white hover:bg-[#1b263b]"
                      data-testid="logout-btn"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1b263b] text-white border-[#415a77]">
                    Logout
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggle}
                      className="w-full text-slate-400 hover:text-white hover:bg-[#1b263b]"
                      data-testid="sidebar-toggle"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1b263b] text-white border-[#415a77]">
                    Expand
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1 text-slate-400 hover:text-white hover:bg-[#1b263b] justify-start gap-2"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="text-slate-400 hover:text-white hover:bg-[#1b263b]"
                  data-testid="sidebar-toggle"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
