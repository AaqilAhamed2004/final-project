import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { LayoutDashboard, Package, FileStack, Truck, Users, Shield, Key, Mail, User, MapPin, Activity, Terminal, Lock, Save, Camera, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = currentUser?.role || 'operator';
  
  const navItems = role === 'super_admin' ? [
    { path: '/dashboard/admin', label: 'Command Center', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/logistics', label: 'Logistics', icon: Truck },
    { path: '/users', label: 'User Management', icon: Users },
  ] : role === 'gn_officer' ? [
    { path: '/dashboard/gn', label: 'Command Center', icon: LayoutDashboard },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/logistics', label: 'Logistics', icon: Truck },
  ] : [

    { path: '/public', label: 'Relief Board', icon: Globe },
    { path: '/contributions', label: 'My Contributions', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-white overflow-hidden">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? `${currentUser.role?.replace('_', ' ')}: ${currentUser.full_name || currentUser.name || 'Prime'}` : 'Personnel'}

        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full overflow-hidden">
        <Navbar 
          title="Personnel Security Profile" 
          user={currentUser} 
          badgeText="ENCRYPTED SESSION"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Top Banner - Hero Profile */}
            <Card className="relative overflow-hidden bg-gradient-to-r from-[#1A140F] to-[#0D0905] border-white/5 p-8 lg:p-12">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Terminal size={200} />
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                  <div className="relative group">
                     <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-2 border-aura-amber/30 p-1 bg-black/40 shadow-[0_0_30px_rgba(255,191,0,0.1)]">
                        <img 
                           src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}&backgroundColor=1C1309`} 
                           className="w-full h-full rounded-full object-cover" 
                           alt="Profile" 
                        />
                     </div>
                     <button className="absolute bottom-1 right-1 w-10 h-10 bg-aura-amber rounded-full flex items-center justify-center text-black border-4 border-[#1A140F] hover:scale-110 transition-transform">
                        <Camera size={18} />
                     </button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                     <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h1 className="text-3xl lg:text-5xl font-bold font-sans tracking-tight">{currentUser?.full_name || currentUser?.name || 'Commander Alpha'}</h1>
                        <span className="px-4 py-1.5 rounded-full bg-aura-amber/10 border border-aura-amber/30 text-[10px] font-mono font-bold text-aura-amber uppercase tracking-[0.2em] w-fit mx-auto md:mx-0">
                           {currentUser?.role?.replace('_', ' ')}
                        </span>
                     </div>
                     <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/40 font-mono text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Mail size={14} className="text-aura-amber/60" /> {currentUser?.email}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-aura-amber/60" /> Central Command HQ</div>
                        <div className="flex items-center gap-2"><Activity size={14} className="text-aura-amber/60" /> Clearace Level 4</div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                     <Button className="py-3 px-8 text-xs font-bold uppercase tracking-widest"><Save size={16} /> Save Changes</Button>
                     <Button variant="secondary" className="py-3 px-8 text-xs font-bold uppercase tracking-widest border-white/5 hover:bg-white/5">Export Credentials</Button>
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-12 gap-8">
               {/* Account Settings */}
               <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                  <Card className="bg-[#140D07] border-white/5 p-8">
                     <div className="flex items-center gap-3 mb-8">
                        <User size={20} className="text-aura-amber" />
                        <h3 className="text-xl font-bold font-sans tracking-tight">Personnel Information</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Full Operational Name</label>
                           <input type="text" defaultValue={currentUser?.full_name} className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-4 text-sm focus:border-aura-amber/40 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Security Email Node</label>
                           <input type="email" defaultValue={currentUser?.email} className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-4 text-sm text-white/40 cursor-not-allowed" disabled />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Division / Sector</label>
                           <input type="text" defaultValue="Sector Alpha - HQ" className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-4 text-sm focus:border-aura-amber/40 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Personnel ID</label>
                           <div className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-4 text-sm text-aura-amber font-mono tracking-widest uppercase">AURA-SEC-{currentUser?._id?.slice(-8).toUpperCase()}</div>
                        </div>
                     </div>
                  </Card>

                  <Card className="bg-[#140D07] border-white/5 p-8">
                     <div className="flex items-center gap-3 mb-8">
                        <Lock size={20} className="text-aura-red" />
                        <h3 className="text-xl font-bold font-sans tracking-tight">Encryption & Security</h3>
                     </div>
                     <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded bg-aura-red/5 border border-aura-red/10">
                           <div className="flex items-center gap-4">
                              <Key size={20} className="text-aura-red/40" />
                              <div>
                                 <div className="text-sm font-bold font-sans text-white/80">Cipher Key Management</div>
                                 <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Last rotated 14 days ago</div>
                              </div>
                           </div>
                           <button className="px-6 py-2 bg-aura-red text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded hover:bg-aura-red/80 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)]">Reset Cipher</button>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded bg-white/[0.02] border border-white/10">
                           <div className="flex items-center gap-4">
                              <Shield size={20} className="text-white/20" />
                              <div>
                                 <div className="text-sm font-bold font-sans text-white/80">Two-Factor Authentication</div>
                                 <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Status: Active (Biometric)</div>
                              </div>
                           </div>
                           <button className="px-6 py-2 bg-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded hover:bg-white/20 transition-colors border border-white/10">Configure</button>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Activity Log */}
               <div className="col-span-12 lg:col-span-4">
                  <Card className="bg-[#0D0905] border-white/5 p-8 h-full">
                     <h3 className="text-xl font-bold font-sans tracking-tight mb-8">Session Activity Log</h3>
                     <div className="space-y-8 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {[
                           { event: 'Profile Synced', time: 'Just Now', icon: Activity, color: 'text-green-500' },
                           { event: 'Authorized Access', time: '2 hours ago', icon: Shield, color: 'text-blue-400' },
                           { event: 'Inventory Audit', time: 'Yesterday', icon: Package, color: 'text-aura-amber' },
                           { event: 'Relief Request Signed', time: '3 days ago', icon: FileStack, color: 'text-aura-amber' },
                           { event: 'Security Login', time: '4 days ago', icon: Lock, color: 'text-aura-red' }
                        ].map((log, i) => (
                           <div key={i} className="flex gap-4 group">
                              <div className="flex flex-col items-center">
                                 <div className={`w-10 h-10 rounded bg-white/[0.02] border border-white/10 flex items-center justify-center ${log.color} group-hover:border-current transition-colors`}>
                                    <log.icon size={18} />
                                 </div>
                                 <div className="w-px h-full bg-white/5 mt-4"></div>
                              </div>
                              <div>
                                 <div className="text-sm font-bold font-sans text-white/80 mb-1">{log.event}</div>
                                 <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{log.time}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
