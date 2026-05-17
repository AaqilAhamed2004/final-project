import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser, registerUser } from '../api';
import { ROLES } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { Activity, AtSign, Lock, Eye, EyeOff, User, Shield, HeartHandshake, UserCog } from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(ROLES.DONOR);
  const [agree, setAgree] = useState(false);
  
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

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!agree) {
      setError('You must agree to the data protocols.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
        role
      });
      // After registration, auto-login or switch to login
      setIsRegistering(false);
      setError('');
      alert('Credentials initialized. You may now access the system.');
    } catch (err) {
      setError(err.message || 'Registration failed. Check system logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-bg flex flex-col font-sans relative">
      {/* Emergency Banner */}
      <div className="bg-aura-accent text-aura-bg py-2 flex justify-center items-center gap-3 text-xs font-mono font-bold tracking-widest w-full shadow-md z-20">
        <Activity size={16} />
        EMERGENCY HOTLINE ACTIVE: 1-800-AURA-SOS
      </div>

      {/* Top Left Header (from Image 1) */}
      <div className="absolute top-12 left-8 flex items-center gap-3 z-10 opacity-80">
        <div className="w-5 h-5 bg-aura-accent rounded-[2px] flex items-center justify-center">
            <div className="w-2.5 h-[2px] bg-aura-bg"></div>
        </div>
        <h2 className="text-aura-accent font-bold tracking-[0.2em] text-lg uppercase">AURA COMMAND</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-4 py-20">
        <Card className="w-full max-w-[460px] p-10 border border-aura-border bg-aura-card shadow-aura-card relative overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-full border-[3.5px] border-aura-accent flex justify-center items-center shadow-aura-glow">
                <div className="w-2.5 h-2.5 rounded-full bg-aura-accent"></div>
              </div>
              <h1 className="text-4xl font-bold tracking-[0.25em] text-aura-text">AURA</h1>
            </div>
            <p className="text-[11px] text-aura-text-faint font-mono tracking-[0.25em] uppercase">Automated Urgent Relief Allocation</p>
          </div>

          <form className="space-y-1" onSubmit={isRegistering ? handleRegister : handleLogin}>
            
            {isRegistering && (
              <div className="mb-8">
                <label className="block text-[10px] font-mono text-aura-text-muted tracking-[0.2em] uppercase mb-4">Select Protocol Rank</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: ROLES.GN_OFFICER, label: 'GN Officer', icon: Shield },
                    { id: ROLES.DONOR, label: 'Donor', icon: HeartHandshake },
                    { id: ROLES.SUPER_ADMIN, label: 'Super Admin', icon: UserCog }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center justify-center py-4 px-2 rounded-lg border transition-all duration-200 ${
                        role === r.id 
                          ? 'border-aura-accent bg-aura-accent-muted text-aura-accent shadow-aura-glow-sm' 
                          : 'border-aura-border bg-aura-surface text-aura-text-faint hover:border-aura-border-strong hover:text-aura-text-muted'
                      }`}
                    >
                      <r.icon size={20} className="mb-2" />
                      <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-center leading-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isRegistering && (
              <Input 
                id="fullName"
                label="Personnel Name"
                placeholder="Full Legal Identity"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                iconLeft={User}
                className="mb-4"
                disabled={isLoading}
                required
              />
            )}

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
              required
            />

            <div className="relative mb-2">
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
                required
              />
            </div>

            {error && <div className="text-aura-red text-[10px] font-mono text-center mb-4 uppercase tracking-wider animate-pulse">{error}</div>}

            {isRegistering ? (
              <div className="flex items-start gap-3 mt-6 mb-8 ml-1 group cursor-pointer" onClick={() => setAgree(!agree)}>
                <div className={`mt-0.5 w-4 h-4 rounded border transition-all flex items-center justify-center ${agree ? 'bg-aura-accent border-aura-accent' : 'bg-transparent border-aura-border group-hover:border-aura-border-strong'}`}>
                  {agree && <div className="w-1.5 h-1.5 bg-aura-bg rounded-sm" />}
                </div>
                <p className="text-[9px] font-mono text-aura-text-muted tracking-[0.1em] leading-relaxed uppercase select-none">
                  I agree to the Global Relief Network data protocols &amp; security act.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4 mb-8 ml-1">
                <input type="checkbox" id="maintain_session" className="w-3.5 h-3.5 accent-aura-accent bg-aura-bg border-aura-border cursor-pointer" />
                <label htmlFor="maintain_session" className="text-[9px] font-mono text-aura-text-faint tracking-[0.1em] cursor-pointer uppercase">Maintain Session Authorization</label>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full py-4 text-xs tracking-[0.3em] font-bold mt-2 flex justify-center items-center uppercase">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isRegistering ? 'Initialize Credentials' : 'Initialize Access'}
            </Button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-10 text-center">
            <button 
              type="button"
              className="text-[10px] font-mono text-aura-accent hover:text-aura-accent-hover transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
            >
              {isRegistering ? (
                <>← Already Authorized? Access System</>
              ) : (
                <>New Personnel? Register Protocol →</>
              )}
            </button>
            
            <div className="mt-8 flex justify-center gap-8 text-[9px] font-mono tracking-widest text-aura-text-faint">
              <span className="hover:text-aura-text-muted cursor-pointer transition-colors" onClick={() => navigate('/public')}>Public Board</span>
              <span className="hover:text-aura-text-muted cursor-pointer transition-colors">Security Policy</span>
              <span className="hover:text-aura-text-muted cursor-pointer transition-colors">System Logs</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Node Status Indicator */}
      <div className="absolute bottom-8 right-8 border border-aura-border bg-aura-card rounded-lg p-4 flex items-start gap-4 shadow-aura-card z-10">
        <div className="mt-1 w-2 h-2 rounded-full bg-aura-accent animate-pulse shadow-aura-glow-sm"></div>
        <div className="font-mono text-[10px] tracking-widest leading-tight">
          <div className="text-aura-text-faint uppercase mb-1">System Status</div>
          <div className="text-aura-accent font-bold">NOMINAL</div>
        </div>
      </div>
    </div>
  );
}
