import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  Settings, 
  Bell,
  Shield,
  Link,
  Palette,
  Globe,
  Clock,
  Volume2,
  Mail,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Check,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    // General
    dashboardName: 'Acadia Safe Dashboard',
    timezone: 'America/Halifax',
    dateFormat: 'MM/DD/YYYY',
    autoRefresh: '30',
    
    // Notifications
    alertSounds: true,
    emergencySound: 'alarm',
    advisorySound: 'chime',
    desktopNotifications: true,
    emailNotifications: true,
    escalationTime: '5',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    sessionTimeout: '60',
    
    // Appearance
    theme: 'light',
    sidebarDefault: 'expanded',
    density: 'comfortable',
    accentColor: '#0d1b2a'
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Dashboard Name</Label>
            <Input
              value={settings.dashboardName}
              onChange={(e) => handleChange('dashboardName', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Halifax">Atlantic Time (Halifax)</SelectItem>
                  <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                  <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(v) => handleChange('dateFormat', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auto-Refresh Interval</Label>
            <Select value={settings.autoRefresh} onValueChange={(v) => handleChange('autoRefresh', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="0">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alert Sounds</p>
              <p className="text-sm text-slate-500">Play sounds for new alerts</p>
            </div>
            <Switch
              checked={settings.alertSounds}
              onCheckedChange={(v) => handleChange('alertSounds', v)}
            />
          </div>
          
          {settings.alertSounds && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-red-500" />
                  Emergency Sound
                </Label>
                <Select value={settings.emergencySound} onValueChange={(v) => handleChange('emergencySound', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alarm">Alarm</SelectItem>
                    <SelectItem value="siren">Siren</SelectItem>
                    <SelectItem value="alert">Alert Tone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-yellow-500" />
                  Advisory Sound
                </Label>
                <Select value={settings.advisorySound} onValueChange={(v) => handleChange('advisorySound', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Desktop Notifications
              </p>
              <p className="text-sm text-slate-500">Show browser notifications</p>
            </div>
            <Switch
              checked={settings.desktopNotifications}
              onCheckedChange={(v) => handleChange('desktopNotifications', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Notifications
              </p>
              <p className="text-sm text-slate-500">Receive email alerts</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => handleChange('emailNotifications', v)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Escalation Time
            </Label>
            <p className="text-sm text-slate-500 mb-2">Alert supervisor if no response within:</p>
            <Select value={settings.escalationTime} onValueChange={(v) => handleChange('escalationTime', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <div className="space-y-6">
          <Card className="p-4">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Change Password
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">Update Password</Button>
            </div>
          </Card>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">Add an extra layer of security</p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(v) => handleChange('twoFactor', v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select value={settings.sessionTimeout} onValueChange={(v) => handleChange('sessionTimeout', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integrations</h3>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 32 32" fill="#F57C00">
                    <path d="M19.62 11.558l-3.203 2.98-2.972-5.995 1.538-3.448c.4-.7 1.024-.692 1.414 0z" />
                    <path d="M13.445 8.543l2.972 5.995-11.97 11.135c-.56.52-1.28.086-.94-.78z" fill="#FFA000" />
                    <path d="M23.123 7.003c.572-.55 1.164-.362 1.315.417l3.116 18.105-10.328 6.2c-.36.2-1.32.286-1.32.286s-.874-.104-1.207-.312L4.447 25.673z" fill="#FFCA28" />
                    <path d="M13.445 8.543l-8.998 17.13c-.34.866.38 1.3.94.78l18.26-18.9c-.152-.78-.744-.968-1.315-.418l-5.915 5.403z" fill="#FFA000" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Firebase</p>
                  <p className="text-sm text-slate-500">Authentication & Database</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-slate-500">FCM Service</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Link className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-400">Add Integration</p>
                  <p className="text-sm text-slate-400">Connect more services</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-4">
              {['light', 'dark', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleChange('theme', theme)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme 
                      ? 'border-[#0d1b2a] bg-slate-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-16 rounded mb-2 ${
                    theme === 'dark' ? 'bg-slate-800' : 
                    theme === 'system' ? 'bg-gradient-to-r from-white to-slate-800' :
                    'bg-white border'
                  }`}></div>
                  <p className="text-sm font-medium capitalize">{theme}</p>
                  {settings.theme === theme && (
                    <Check className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sidebar Default</Label>
            <Select value={settings.sidebarDefault} onValueChange={(v) => handleChange('sidebarDefault', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expanded">Expanded</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Display Density</Label>
            <Select value={settings.density} onValueChange={(v) => handleChange('density', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'integrations': return renderIntegrationSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your dashboard preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#0d1b2a] hover:bg-[#1b263b] flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card className="p-2 h-fit">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full settings-tab flex items-center gap-3 rounded-lg ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  data-testid={`settings-tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3 p-6">
          {renderTabContent()}
        </Card>
      </div>
    </div>
  );
}
