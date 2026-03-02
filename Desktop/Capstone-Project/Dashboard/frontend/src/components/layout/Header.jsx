import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const pathNames = {
  '/dashboard': 'Dashboard',
  '/alerts': 'Emergency Alerts',
  '/incidents': 'Incident Reports',
  '/escorts': 'Safety Escorts',
  '/broadcast': 'Broadcast Alerts',
  '/analytics': 'Analytics & Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export const Header = () => {
  const location = useLocation();
  const { userData, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const currentPath = pathNames[location.pathname] || 'Dashboard';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getInitials = (name) => {
    if (!name) return 'SO';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs & Welcome */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{currentPath}</span>
          </div>
          <p className="text-sm text-slate-500">{currentDate}</p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 bg-slate-50 border-slate-200 focus:bg-white"
              data-testid="search-input"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                data-testid="notifications-btn"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="notification-badge">3</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="font-medium text-sm">New SOS Alert</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Sarah Johnson triggered an emergency alert</p>
                <span className="text-xs text-slate-400 pl-4">2 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-medium text-sm">Escort Request</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">New escort request from Library to Dorm A</p>
                <span className="text-xs text-slate-400 pl-4">5 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="font-medium text-sm">Incident Reported</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Suspicious activity reported near parking lot</p>
                <span className="text-xs text-slate-400 pl-4">15 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-blue-600 cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-2"
                data-testid="profile-menu-btn"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#0d1b2a] text-white text-xs">
                    {getInitials(userData?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900">{userData?.name || 'Officer'}</p>
                  <p className="text-xs text-slate-500 capitalize">{userData?.role || 'Officer'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
