import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getAllRequests, updateStatus } from '../api';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/common/StatusBadge';
import { LayoutDashboard, Package, FileStack, Truck, Users, Plus, Globe, ChevronDown, MessageSquare, Info, ShieldAlert } from 'lucide-react';
import { formatRequestId } from '../utils/priorityHelpers';

export default function AdminRequestsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = currentUser?.role;

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-aware nav: GN Officers see their own command center; Admins see theirs.
  const navItems = role === 'gn_officer' ? [
    { path: '/dashboard/gn', label: 'Command Center', icon: LayoutDashboard },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/logistics', label: 'Logistics', icon: Truck },
  ] : [
    { path: '/dashboard/admin', label: 'Command Center', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/logistics', label: 'Logistics', icon: Truck },
    { path: '/users', label: 'User Management', icon: Users },
  ];

  const sessionText = role === 'gn_officer'
    ? `GN Officer: ${currentUser?.full_name || 'Operator'}`
    : `Admin: ${currentUser?.full_name || 'Prime'}`;

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-white">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? sessionText : 'Personnel'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full overflow-hidden">
        <Navbar 
          title="Relief Request Management Workflow" 
          user={currentUser} 
          badgeText="CRITICAL OPS ACTIVE"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Top Section - Map Placeholder */}
            <Card className="p-0 border-white/5 bg-[#0D0905] overflow-hidden relative min-h-[300px]">
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded border border-white/10 bg-black/60 flex items-center justify-center text-white/40 hover:text-white cursor-pointer">+</div>
                  <div className="w-8 h-8 rounded border border-white/10 bg-black/60 flex items-center justify-center text-white/40 hover:text-white cursor-pointer">-</div>
               </div>
               <div className="w-full h-[300px] bg-[#110C07] relative flex items-center justify-center">
                  <Globe size={120} className="text-white/[0.03]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-[10px] font-mono tracking-[0.4em] text-white/10 uppercase font-bold">Tactical Deployment Map (Simulated)</span>
                  </div>
                  {/* Mock pings */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-aura-red rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse opacity-75"></div>
                  <div className="absolute top-1/2 right-1/2 w-2 h-2 bg-aura-amber rounded-full animate-pulse opacity-50"></div>
               </div>
            </Card>

            <div className="grid grid-cols-12 gap-8">
               {/* Left Column - Request Queue */}
               <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <h2 className="text-2xl font-bold font-sans tracking-tight">Relief Request Queue</h2>
                     <Button className="w-full sm:w-auto py-2.5 px-6 text-xs uppercase tracking-widest font-bold">
                        <Plus size={16} />
                        Initiate Global Request
                     </Button>
                  </div>

                  <Card className="flex-1 p-0 overflow-hidden bg-[#140D07] border-white/5 shadow-2xl">
                     <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1100px]">
                           <thead>
                              <tr className="border-b border-white/5 bg-white/[0.01]">
                                 {['Request ID', 'Priority', 'Status', 'Request Type', 'Requester', 'Request Location', 'Specific Items', 'Urgency', 'ETD', 'Assigned Team'].map(h => (
                                    <th key={h} className="text-left py-5 px-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">{h}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/[0.03]">
                              {requests.map((req) => (
                                 <tr key={req._id} className="hover:bg-white/[0.01] transition-colors group cursor-pointer">
                                    <td className="py-5 px-6 font-mono text-[10px] font-bold text-aura-amber tracking-widest uppercase">RR-{req._id?.slice(-4)}</td>
                                    <td className="py-5 px-6"><Badge priority={req.priority_level} /></td>
                                    <td className="py-5 px-6"><StatusBadge status={req.status} /></td>
                                    <td className="py-5 px-6 text-[10px] font-mono text-white/60 uppercase">{req.request_type || 'Aura-Led'}</td>
                                    <td className="py-5 px-6">
                                       <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-mono text-white/40 uppercase tracking-widest">
                                             <Users size={10} />
                                          </div>
                                          <div className="text-[11px] font-sans text-white/70">Commander {req._id?.slice(0, 2)}</div>
                                       </div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[11px] font-sans text-white/90 truncate max-w-[120px]" title={req.location}>{req.location}</div>
                                       <div className="text-[9px] font-mono text-white/20 uppercase mt-0.5 tracking-tighter truncate max-w-[120px]">09.232° N | {req._id?.slice(-3)} E</div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[10px] font-mono text-white/50 leading-relaxed">
                                          {req.items?.slice(0, 2).map(i => `${i.item_name} x${i.quantity || i.quantity_needed}`).join(', ')}
                                          {req.items?.length > 2 && '...'}
                                       </div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">{req.priority_level || 'Urgent'}</div>
                                    </td>
                                    <td className="py-5 px-6 text-[10px] font-mono text-white/40">{req.etd || '20h'}</td>
                                    <td className="py-5 px-6">
                                       <div className="flex items-center gap-2 bg-[#1A140F] border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-aura-amber/40 transition-colors">
                                          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{req.assigned_team || 'Fleet Units 1'}</span>
                                          <ChevronDown size={12} className="text-white/30" />
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </div>

               {/* Right Column - Deep Dive Sidebar */}
               <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
                  <Card className="flex flex-col bg-[#0D0905] border-white/5 p-6 h-full min-h-[600px]">
                     <div className="mb-8">
                        <h3 className="text-lg font-bold font-sans tracking-tight">Request Deep-Dive</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-aura-amber animate-pulse"></div>
                           <span className="text-[9px] font-mono text-aura-amber tracking-[0.2em] uppercase font-bold">Live Context</span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Selected Request Summary */}
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-4">
                           <div className="flex items-center gap-2 text-aura-amber">
                              <ShieldAlert size={16} />
                              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Tactical Alert</span>
                           </div>
                           <p className="text-xs text-white/60 leading-relaxed italic">"Severe flooding has compromised ground access in Sector 7. Air-drop logistics prioritized."</p>
                        </div>

                        {/* Comms Log */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2">
                              <MessageSquare size={14} className="text-white/30" />
                              <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">Logistics Comms</h4>
                           </div>
                           {[1, 2].map(i => (
                              <div key={i} className="flex gap-3">
                                 <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/40">HQ</div>
                                 <div className="flex-1">
                                    <div className="text-[9px] font-mono text-white/30 uppercase mb-1">Headquarters • 28m ago</div>
                                    <div className="text-[11px] font-sans text-white/70 leading-relaxed bg-[#1A140F] p-3 rounded border border-white/5 shadow-lg relative">
                                       <div className="absolute top-2 -left-1 w-2 h-2 bg-[#1A140F] rotate-45 border-l border-b border-white/5"></div>
                                       Awaiting confirmation from Hub Delta on Trauma Kit availability.
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="mt-8 pt-6 border-t border-white/5">
                        <Button variant="secondary" className="w-full py-4 text-[9px] tracking-[0.3em] font-mono uppercase text-white/40 hover:text-white border-white/5 hover:bg-white/[0.02]">
                           Generate Ops Report
                        </Button>
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
