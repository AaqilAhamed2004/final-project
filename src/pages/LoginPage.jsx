import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { users } from '../data/users';
import { ROLES } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { Shield, HeartHandshake, ShieldAlert, AtSign, Lock, Eye, Activity, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.GN_OFFICER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-fill credentials based on role selection for convenience
  useEffect(() => {
    const defaultUser = users.find(u => u.role === selectedRole);
    if (defaultUser) {
      setEmail(defaultUser.email);
      setPassword(defaultUser.password);
    }
  }, [selectedRole]);

  const handleLogin = () => {
    setError('');
    const user = users.find(u => u.role === selectedRole && u.email === email && u.password === password);
    
    if (user) {
      login(user);
      if (user.role === ROLES.GN_OFFICER) navigate('/dashboard/gn');
      else if (user.role === ROLES.DONOR) navigate('/dashboard/donor');
      else if (user.role === ROLES.SUPER_ADMIN) navigate('/dashboard/admin');
    } else {
      setError('Invalid identity or cipher. Please verify credentials.');
    }
  };

  const roleOptions = [
    { role: ROLES.GN_OFFICER, label: 'GN Officer', icon: Shield },
    { role: ROLES.DONOR, label: 'Donor', icon: HeartHandshake },
    { role: ROLES.SUPER_ADMIN, label: 'Super Admin', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-aura-bg flex flex-col font-sans relative">
      {/* Emergency Banner */}
      <div className="bg-aura-amber text-black py-2 flex justify-center items-center gap-3 text-xs font-mono font-bold tracking-widest w-full shadow-md z-10">
        <Activity size={16} />
        EMERGENCY HOTLINE ACTIVE: 1-800-AURA-SOS
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-4">
        <Card className="w-full max-w-[420px] p-8 border border-white/10 bg-[#140D07]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full border-[3px] border-aura-amber flex justify-center items-center">
                <div className="w-2 h-2 rounded-full bg-aura-amber"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-widest text-white">AURA</h1>
            </div>
            <p className="text-[10px] text-white/50 font-mono tracking-[0.18em]">AUTOMATED URGENT RELIEF ALLOCATION</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-mono text-white/70 mb-3">Select Access Protocol</label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => setSelectedRole(opt.role)}
                  className={`flex flex-col items-center justify-center py-4 rounded border transition-colors duration-200 ${
                    selectedRole === opt.role 
                      ? 'border-aura-amber text-aura-amber bg-aura-amber/5' 
                      : 'border-white/10 text-white/50 hover:bg-white/5'
                  }`}
                >
                  <opt.icon size={20} className="mb-2" />
                  <span className="text-[10px] font-mono whitespace-nowrap">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <Input 
              id="email"
              label="System Identity (Email)"
              type="email"
              placeholder="operator@aura.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={AtSign}
              className="mb-4"
            />

            <div className="relative mb-2">
              <div className="flex justify-between items-center mb-2 absolute top-0 w-full z-10">
                <span className="text-xs text-white/70 font-sans" style={{ visibility: 'hidden' }}>Secure Cipher (Password)</span>
                <button className="text-[9px] font-mono text-aura-amber hover:underline uppercase tracking-wider -mt-7 mr-1">Reset Cipher</button>
              </div>
              <Input 
                id="password"
                label="Secure Cipher (Password)"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconLeft={Lock}
                iconRight={showPassword ? EyeOff : Eye}
                onIconRightClick={() => setShowPassword(!showPassword)}
                className="mb-2"
              />
            </div>

            {error && <div className="text-aura-red text-xs font-mono text-center mt-2">{error}</div>}

            <div className="flex items-center gap-2 mt-4 mb-6 ml-1">
              <input type="checkbox" id="maintain_session" className="w-3.5 h-3.5 accent-aura-amber bg-[#0D0905] border-white/20 cursor-pointer" />
              <label htmlFor="maintain_session" className="text-[9px] font-mono text-white/50 tracking-[0.1em] cursor-pointer">MAINTAIN SESSION AUTHORIZATION</label>
            </div>

            <Button className="w-full py-3.5 text-sm tracking-widest mt-2" onClick={handleLogin}>
              INITIALIZE ACCESS
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex justify-center gap-6 text-[10px] font-mono tracking-widest text-white/70">
              <span className="hover:text-white cursor-pointer transition-colors">SYSTEM STATUS</span>
              <span className="hover:text-white cursor-pointer transition-colors">SECURITY POLICY</span>
            </div>
            <div className="text-[9px] font-mono text-white/30 tracking-wider leading-relaxed">
              AURA V4.2.0 | SECURE CONNECTION ESTABLISHED<br/>
              © 2026 GLOBAL RELIEF NETWORK DATA CENTER
            </div>
          </div>
        </Card>
      </div>

      {/* Node Status Indicator */}
      <div className="absolute bottom-6 right-6 border border-white/10 bg-[#140D07] rounded-md p-3 flex items-start gap-3 shadow-lg">
        <div className="mt-1 w-2 h-2 rounded-full bg-aura-amber animate-pulse"></div>
        <div className="font-mono text-[10px] tracking-widest leading-tight">
          <div className="text-white/70">NODE: SYD-02</div>
          <div className="text-aura-amber mt-0.5">SIGNAL: NOMINAL</div>
        </div>
      </div>
    </div>
  );
}
