import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../api';
import { ROLES } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { Activity, AtSign, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data.access_token, data.user);

      if (data.user.role === ROLES.GN_OFFICER) navigate('/dashboard/gn');
      else if (data.user.role === ROLES.DONOR) navigate('/dashboard/donor');
      else if (data.user.role === ROLES.SUPER_ADMIN) navigate('/dashboard/admin');
    } catch (err) {
      setError(err.message || 'Invalid identity or cipher. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Form */}
          <form className="space-y-2" onSubmit={handleLogin}>
            <Input 
              id="email"
              label="System Identity (Email)"
              type="email"
              placeholder="operator@aura.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={AtSign}
              className="mb-4"
              disabled={isLoading}
            />

            <div className="relative mb-2">
              <div className="flex justify-between items-center mb-2 absolute top-0 w-full z-10">
                <span className="text-xs text-white/70 font-sans" style={{ visibility: 'hidden' }}>Secure Cipher (Password)</span>
                <button type="button" className="text-[9px] font-mono text-aura-amber hover:underline uppercase tracking-wider -mt-7 mr-1">Reset Cipher</button>
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
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-aura-red text-xs font-mono text-center mt-2">{error}</div>}

            <div className="flex items-center gap-2 mt-4 mb-6 ml-1">
              <input type="checkbox" id="maintain_session" className="w-3.5 h-3.5 accent-aura-amber bg-[#0D0905] border-white/20 cursor-pointer" />
              <label htmlFor="maintain_session" className="text-[9px] font-mono text-white/50 tracking-[0.1em] cursor-pointer">MAINTAIN SESSION AUTHORIZATION</label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-3.5 text-sm tracking-widest mt-2 flex justify-center items-center">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              INITIALIZE ACCESS
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex justify-center gap-6 text-[10px] font-mono tracking-widest text-white/70">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/public')}>PUBLIC BOARD →</span>
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
