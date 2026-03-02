import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { ShieldCheck, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await register(formData.email, formData.password, formData.name);
        if (result.success) {
          toast.success('Account created successfully!');
        }
      } else {
        result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Welcome back!');
        }
      }

      if (!result.success) {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 login-split-left relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1769699369445-263a7a365df7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsJTIwdmlld3xlbnwwfHx8fDE3NzIyNDE1NTZ8MA&ixlib=rb-4.1.0&q=85)' 
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="w-24 h-24 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-8 shadow-2xl">
            <ShieldCheck className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 text-center">Acadia Safe</h1>
          <p className="text-xl text-slate-300 mb-8 text-center">Student Safety App</p>
          <div className="max-w-md text-center">
            <p className="text-slate-400 text-lg leading-relaxed">
              Stay safe on campus — report incidents, request a safe-walk escort,
              and receive real-time emergency alerts from Acadia University Security.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-8 text-slate-400">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm">Support</p>
            </div>
            <div className="w-px h-12 bg-slate-600"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">1-tap</p>
              <p className="text-sm">Safe Walk</p>
            </div>
            <div className="w-px h-12 bg-slate-600"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">Live</p>
              <p className="text-sm">Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-[#0d1b2a] flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Acadia Safe</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500">
              {isRegister
                ? 'Register to access campus safety services'
                : 'Sign in to stay safe on campus'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={isRegister}
                  className="h-12"
                  data-testid="name-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@acadiau.ca"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 pl-11"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 pl-11 pr-11"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button 
                  type="button" 
                  className="text-sm text-[#3182ce] hover:underline"
                  data-testid="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#0d1b2a] hover:bg-[#1b263b] text-white font-medium"
              disabled={isLoading}
              data-testid="submit-btn"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#3182ce] hover:underline font-medium"
                data-testid="toggle-auth-mode"
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-center text-sm text-slate-400">
              Acadia University Safety & Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
