import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { LayoutDashboard, Package, FileStack, Truck, Users, Plus, Search, Radio, Plane, Ship, Map, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AdminLogisticsPage() {
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

  const fleetData = [
    { id: '#FL-001', type: 'Convoy Alpha', route: 'North Sector → HQ-02', task: 'Medical Resupply', status: 'Active', icon: Truck },
    { id: '#FL-004', type: 'Air Support Bravo', route: 'East Coast Zone', task: 'Surveillance Scan', status: 'Active', icon: Plane },
    { id: '#FL-012', type: 'Marine Unit 09', route: 'Harbor Point C', task: 'Refueling', status: 'At Depot', icon: Ship },
    { id: '#FL-028', type: 'Convoy Gamma', route: 'South Perimeter', task: 'Awaiting Orders', status: 'Idle', icon: Truck },
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
          title="Logistics Operations" 
          user={currentUser} 
          badgeText="SYSTEM STATUS: ACTIVE"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            
            {/* Main Content Column */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-lg">
                     <button className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase bg-aura-amber text-black font-bold rounded shadow-[0_0_15px_rgba(255,191,0,0.2)]">All Units</button>
                     <button className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">Airborne</button>
                     <button className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">Convoys</button>
                  </div>
                  <Button className="w-full md:w-auto py-3 px-8 text-[10px] uppercase tracking-[0.2em] font-bold">
                     <Plus size={16} /> Add New Fleet Unit
                  </Button>
               </div>

               {/* Fleet Table */}
               <Card className="flex-1 p-0 overflow-hidden bg-[#140D07] border-white/5 shadow-2xl">
                  <div className="overflow-x-auto">
                     <table className="w-full border-collapse">
                        <thead>
                           <tr className="border-b border-white/5 bg-white/[0.01]">
                              {['Fleet ID', 'Fleet Type', 'Route/Destination', 'Current Task', 'Status'].map(h => (
                                 <th key={h} className="text-left py-6 px-8 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">{h}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                           {fleetData.map((unit) => (
                              <tr key={unit.id} className="hover:bg-white/[0.01] transition-colors group">
                                 <td className="py-8 px-8 font-mono text-sm font-bold text-white/80">{unit.id}</td>
                                 <td className="py-8 px-8">
                                    <div className="flex items-center gap-4">
                                       <unit.icon size={20} className="text-white/20 group-hover:text-aura-amber transition-colors" />
                                       <div className="text-sm font-sans font-bold text-white/90">{unit.type}</div>
                                    </div>
                                 </td>
                                 <td className="py-8 px-8 text-sm font-sans text-white/60">{unit.route}</td>
                                 <td className="py-8 px-8 text-sm font-sans italic text-white/40">{unit.task}</td>
                                 <td className="py-8 px-8">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest ${
                                       unit.status === 'Active' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                       unit.status === 'At Depot' ? 'bg-aura-amber/10 border-aura-amber/30 text-aura-amber' :
                                       'bg-white/5 border-white/10 text-white/20'
                                    }`}>
                                       <div className={`w-1.5 h-1.5 rounded-full ${unit.status === 'Active' ? 'bg-green-500 animate-pulse' : unit.status === 'At Depot' ? 'bg-aura-amber' : 'bg-white/20'}`}></div>
                                       {unit.status}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>

               {/* Fleet Summary Stats */}
               <div className="mt-auto flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-t border-white/5">
                  <div className="flex gap-12">
                     <div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1">Total Fleet</div>
                        <div className="text-2xl font-bold font-sans">1,280</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1 text-aura-amber">Deployed</div>
                        <div className="text-2xl font-bold font-sans text-aura-amber">745</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1">Available</div>
                        <div className="text-2xl font-bold font-sans">535</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Showing 1-12 of 128 results</span>
                     <div className="flex gap-2">
                        <button className="p-2 border border-white/10 rounded hover:bg-white/5 text-white/20 transition-colors"><ChevronLeft size={16}/></button>
                        <button className="p-2 border border-white/10 rounded hover:bg-white/5 text-white/20 transition-colors"><ChevronRight size={16}/></button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Side Column - Live Updates & Map */}
            <div className="col-span-12 xl:col-span-3 flex flex-col gap-8">
               <Card className="flex flex-col bg-[#0D0905] border-white/5 p-6 min-h-[500px]">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-lg font-bold font-sans tracking-tight">Logistics Live Update</h3>
                     <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest">Live</span>
                  </div>

                  <div className="space-y-6">
                     {[
                        { user: 'Sgt. Meyer', time: '09:42', msg: 'AURA-04 departed for East Coast Zone. ETA: 10:15' },
                        { user: 'Lt. Danvers', time: '09:38', msg: 'Convoy ALPHA-7 re-routed to avoid landslide at Route 12.' },
                        { user: 'Capt. Rogers', time: '09:25', msg: 'Refueling of MARINE-09 complete. Unit standby.' }
                     ].map((update, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                           <div className="w-px h-full bg-white/5 relative">
                              <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-aura-amber"></div>
                           </div>
                           <div className="flex-1 pb-4">
                              <div className="flex justify-between items-center mb-1">
                                 <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10"></div>
                                    <span className="text-[10px] font-mono font-bold text-white/60">{update.user}</span>
                                 </div>
                                 <span className="text-[9px] font-mono text-white/20">{update.time}</span>
                              </div>
                              <div className="text-[11px] font-sans text-white/70 leading-relaxed bg-white/[0.02] p-3 rounded border border-white/5 group-hover:border-aura-amber/30 transition-colors">
                                 {update.msg}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <button className="mt-auto w-full py-3 border border-white/5 rounded text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">View Full Transcript</button>
               </Card>

               <Card className="p-0 border-white/5 bg-[#0D0905] overflow-hidden aspect-video relative group">
                  <div className="w-full h-full bg-[#110C07] flex items-center justify-center">
                     <Map size={48} className="text-white/[0.03]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <span className="text-[8px] font-mono text-aura-amber tracking-[0.3em] uppercase font-bold mb-1">Tactical View</span>
                        <h4 className="text-sm font-sans font-bold">Sector 07 Overlay</h4>
                     </div>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <Radio size={14} className="text-aura-amber" />
                  </div>
               </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
