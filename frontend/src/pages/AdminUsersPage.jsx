import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { LayoutDashboard, Package, FileStack, Truck, Users, Plus, Search, ShieldCheck, UserPlus, Edit3, Trash2, History, Database, CheckCircle2, XCircle, Radio } from 'lucide-react';


export default function AdminUsersPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/admin', label: 'Command Center', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/logistics', label: 'Logistics', icon: Truck },
    { path: '/users', label: 'User Management', icon: Users },
  ];

  const userData = [
    { id: '#U-8821', name: 'Elias Thorne', role: 'Super Admin', division: 'Sector Alpha', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elias' },
    { id: '#U-9432', name: 'Sarah Kincaid', role: 'GN Officer', division: 'Intelligence', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '#U-1109', name: 'Marcus Reeds', role: 'Admin', division: 'Logistics', status: 'Inactive', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: '#U-7622', name: 'Jana Petrova', role: 'GN Officer', division: 'Sector Alpha', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jana' },
  ];

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-white">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? `Admin: ${currentUser.full_name || currentUser.name || 'Prime'}` : 'Admin'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full overflow-hidden">
        <Navbar 
          title="User Management Directory" 
          user={currentUser} 
          badgeText="DB_STATUS: NOMINAL"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            
            {/* Main Content - User Table */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-bold font-sans tracking-tight mb-2">Personnel Oversight</h2>
                    <p className="text-white/40 text-sm font-sans">Personnel authorization gateway and secure identity management.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-lg w-full md:w-auto">
                     <button className="flex-1 md:px-6 py-2.5 text-[10px] font-mono tracking-widest uppercase bg-aura-amber text-black font-bold rounded shadow-[0_0_15px_rgba(255,191,0,0.2)]">All</button>
                     <button className="flex-1 md:px-6 py-2.5 text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">Field</button>
                     <button className="flex-1 md:px-6 py-2.5 text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">HQ</button>
                  </div>
                  <Button className="w-full md:w-auto py-3.5 px-8 text-[10px] uppercase tracking-[0.2em] font-bold">
                     <UserPlus size={16} /> Register New User
                  </Button>
               </div>

               <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-aura-amber transition-colors" />
                  <input 
                    type="text" 
                    placeholder="QUERY DATABASE..." 
                    className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-4 px-12 text-sm font-mono tracking-widest focus:border-aura-amber/40 outline-none transition-all placeholder:text-white/10"
                  />
               </div>

               {/* User Table Card */}
               <Card className="flex-1 p-0 overflow-hidden bg-[#140D07] border-white/5 shadow-2xl">
                  <div className="overflow-x-auto">
                     <table className="w-full border-collapse">
                        <thead>
                           <tr className="border-b border-white/5 bg-white/[0.01]">
                              {['User ID', 'Full Name', 'Role', 'Division', 'Account Status', 'Actions'].map(h => (
                                 <th key={h} className="text-left py-6 px-8 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">{h}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                           {userData.map((user) => (
                              <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                                 <td className="py-8 px-8 font-mono text-sm font-bold text-aura-amber tracking-widest">{user.id}</td>
                                 <td className="py-8 px-8">
                                    <div className="flex items-center gap-4">
                                       <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" alt={user.name} />
                                       <div className="text-sm font-sans font-bold text-white/90">{user.name}</div>
                                    </div>
                                 </td>
                                 <td className="py-8 px-8">
                                    <span className={`px-2 py-1 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest border ${
                                       user.role === 'Super Admin' ? 'bg-aura-red/10 border-aura-red/30 text-aura-red' :
                                       user.role === 'GN Officer' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                       'bg-white/5 border-white/10 text-white/40'
                                    }`}>
                                       {user.role}
                                    </span>
                                 </td>
                                 <td className="py-8 px-8 text-sm font-sans text-white/60">{user.division}</td>
                                 <td className="py-8 px-8">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest ${
                                       user.status === 'Active' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                       'bg-white/5 border-white/10 text-white/20'
                                    }`}>
                                       <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}></div>
                                       {user.status}
                                    </div>
                                 </td>
                                 <td className="py-8 px-8">
                                    <div className="flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                       <button className="text-white/60 hover:text-aura-amber transition-colors"><Edit3 size={16} /></button>
                                       <button className="text-white/60 hover:text-aura-red transition-colors"><Trash2 size={16} /></button>
                                       <button className="text-white/60 hover:text-blue-400 transition-colors"><History size={16} /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>

               {/* Stats Strip */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-lg flex items-center justify-between">
                     <div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1">Total Users</div>
                        <div className="text-2xl font-bold font-sans">1,284</div>
                     </div>
                     <Users size={24} className="text-white/10" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-lg flex items-center justify-between border-l-2 border-l-green-500/30">
                     <div>
                        <div className="text-[10px] font-mono text-green-500/40 uppercase tracking-[0.2em] mb-1">Active Now</div>
                        <div className="text-2xl font-bold font-sans text-green-500">412</div>
                     </div>
                     <Radio size={24} className="text-green-500/20" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-lg flex items-center justify-between border-l-2 border-l-aura-amber/30">
                     <div>
                        <div className="text-[10px] font-mono text-aura-amber/40 uppercase tracking-[0.2em] mb-1">Pending Auth</div>
                        <div className="text-2xl font-bold font-sans text-aura-amber">18</div>
                     </div>
                     <ShieldCheck size={24} className="text-aura-amber/20" />
                  </div>
               </div>
            </div>

            {/* Sidebar - User Activity Log */}
            <div className="col-span-12 xl:col-span-3">
               <Card className="flex flex-col bg-[#0D0905] border-white/5 p-6 min-h-[600px] h-full">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h3 className="text-lg font-bold font-sans tracking-tight">User System Activity Log</h3>
                        <p className="text-[9px] font-mono text-white/30 uppercase mt-1 tracking-widest">Real-time authorization flow</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest">Live</span>
                        <History size={14} className="text-white/20" />
                     </div>
                  </div>

                  <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                     {[
                        { name: 'Sarah Kincaid', msg: 'updated role permissions for #U-1109', time: '12:44:02 // 03.11.24', color: 'bg-aura-amber' },
                        { name: 'Elias Thorne', msg: 'successful login via HQ Terminal 4', time: '12:41:55 // 03.11.24', color: 'bg-green-500' },
                        { name: 'Officer T. Lang', msg: 'New registration pending approval', time: '12:38:12 // 03.11.24', color: 'bg-aura-amber', action: true },
                        { name: 'Jana Petrova', msg: 'modified Sector Alpha inventory access', time: '12:15:30 // 03.11.24', color: 'bg-white/20' }
                     ].map((log, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                           <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${log.color} shadow-[0_0_8px_currentColor]`}></div>
                              <div className="w-px h-full bg-white/5 mt-2"></div>
                           </div>
                           <div className="flex-1 pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.name}`} alt="" />
                                 </div>
                                 <span className="text-[11px] font-sans font-bold text-white/80">{log.name}</span>
                              </div>
                              <div className="text-[11px] font-sans text-white/40 leading-relaxed mb-2">
                                 {log.msg}
                              </div>
                              <div className="text-[9px] font-mono text-white/20 uppercase tracking-tighter mb-3">{log.time}</div>
                              
                              {log.action && (
                                 <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 bg-aura-amber/10 border border-aura-amber/30 text-[9px] font-mono text-aura-amber uppercase tracking-widest font-bold hover:bg-aura-amber hover:text-black transition-all rounded">Approve</button>
                                    <button className="flex-1 py-1.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold hover:bg-aura-red hover:text-white hover:border-aura-red transition-all rounded">Deny</button>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  <button className="mt-8 w-full py-4 bg-white/[0.02] border border-white/5 rounded text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all hover:bg-white/[0.04]">View All System Events</button>
               </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
