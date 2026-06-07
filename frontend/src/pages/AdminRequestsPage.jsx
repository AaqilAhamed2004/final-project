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
    <div className="min-h-screen bg-aura-bg flex font-sans text-aura-text">
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
          badgeColorClass="border-aura-red text-aura-red"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Top Section - Map Placeholder */}
            <Card className="p-0 border-aura-border bg-aura-card overflow-hidden relative min-h-[300px]">
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded border border-aura-border bg-black/60 flex items-center justify-center text-aura-text-faint hover:text-aura-text cursor-pointer">+</div>
                  <div className="w-8 h-8 rounded border border-aura-border bg-black/60 flex items-center justify-center text-aura-text-faint hover:text-aura-text cursor-pointer">-</div>
               </div>
               <div className="w-full h-[300px] bg-aura-surface relative flex items-center justify-center">
                  <Globe size={120} className="text-aura-text-faint opacity-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-[10px] font-mono tracking-[0.4em] text-aura-text-faint uppercase font-bold">Tactical Deployment Map (Simulated)</span>
                  </div>
                  {/* Mock pings */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-aura-red rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-aura-blue rounded-full animate-pulse opacity-75"></div>
                  <div className="absolute top-1/2 right-1/2 w-2 h-2 bg-aura-accent rounded-full animate-pulse opacity-50"></div>
               </div>
            </Card>

            <div className="grid grid-cols-12 gap-8">
               {/* Left Column - Request Queue */}
               <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <h2 className="text-2xl font-bold font-sans tracking-tight text-aura-text">Relief Request Queue</h2>
                     <Button className="w-full sm:w-auto py-2.5 px-6 text-xs uppercase tracking-widest font-bold">
                        <Plus size={16} />
                        Initiate Global Request
                     </Button>
                  </div>

                  <Card className="flex-1 p-0 overflow-hidden shadow-aura-card">
                     <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1100px]">
                           <thead>
                              <tr className="border-b border-aura-border bg-aura-surface">
                                 {['Request ID', 'Priority', 'Status', 'Request Type', 'Requester', 'Request Location', 'Specific Items', 'Urgency', 'ETD', 'Assigned Team'].map(h => (
                                    <th key={h} className="text-left py-5 px-6 text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-[0.2em]">{h}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-aura-border">
                              {requests.map((req) => (
                                 <tr key={req.id || req._id} className="hover:bg-aura-surface-hover transition-colors group cursor-pointer">
                                    <td className="py-5 px-6 font-mono text-[10px] font-bold text-aura-accent tracking-widest uppercase">RR-{(req.id || req._id)?.slice(-4)}</td>
                                    <td className="py-5 px-6"><Badge priority={req.priority_level} /></td>
                                    <td className="py-5 px-6"><StatusBadge status={req.status} /></td>
                                    <td className="py-5 px-6 text-[10px] font-mono text-aura-text-faint uppercase">{req.request_type || 'Aura-Led'}</td>
                                    <td className="py-5 px-6">
                                       <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-aura-surface border border-aura-border flex items-center justify-center text-[8px] font-mono text-aura-text-muted uppercase tracking-widest">
                                             <Users size={10} />
                                          </div>
                                          <div className="text-[11px] font-sans text-aura-text-muted">Commander {(req.id || req._id)?.slice(0, 2)}</div>
                                       </div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[11px] font-sans text-aura-text truncate max-w-[120px]" title={req.location}>{req.location}</div>
                                       <div className="text-[9px] font-mono text-aura-text-faint uppercase mt-0.5 tracking-tighter truncate max-w-[120px]">09.232° N | {(req.id || req._id)?.slice(-3)} E</div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[10px] font-mono text-aura-text-muted leading-relaxed">
                                          {req.items?.slice(0, 2).map(i => `${i.item_name} x${i.quantity || i.quantity_needed}`).join(', ')}
                                          {req.items?.length > 2 && '...'}
                                       </div>
                                    </td>
                                    <td className="py-5 px-6">
                                       <div className="text-[10px] font-mono font-bold text-aura-text-faint uppercase tracking-widest">{req.priority_level || 'Urgent'}</div>
                                    </td>
                                    <td className="py-5 px-6 text-[10px] font-mono text-aura-text-faint">{req.etd || '20h'}</td>
                                    <td className="py-5 px-6">
                                       <div className="flex items-center gap-2 bg-aura-surface border border-aura-border rounded px-2 py-1 cursor-pointer hover:border-aura-accent/40 transition-colors">
                                          <span className="text-[10px] font-mono text-aura-text-faint uppercase tracking-widest">{req.assigned_team || 'Fleet Units 1'}</span>
                                          <ChevronDown size={12} className="text-aura-text-muted" />
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
                  <Card className="flex flex-col bg-aura-bg border-aura-border p-6 h-full min-h-[600px]">
                     <div className="mb-8">
                        <h3 className="text-lg font-bold font-sans tracking-tight text-aura-text">Request Deep-Dive</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-aura-accent animate-pulse"></div>
                           <span className="text-[9px] font-mono text-aura-accent tracking-[0.2em] uppercase font-bold">Live Context</span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Selected Request Summary */}
                        <div className="p-4 rounded-lg bg-aura-surface border border-aura-border space-y-4">
                           <div className="flex items-center gap-2 text-aura-accent">
                              <ShieldAlert size={16} />
                              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Tactical Alert</span>
                           </div>
                           <p className="text-xs text-aura-text-muted leading-relaxed italic">"Severe flooding has compromised ground access in Sector 7. Air-drop logistics prioritized."</p>
                        </div>

                        {/* Comms Log */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2">
                              <MessageSquare size={14} className="text-aura-text-faint" />
                              <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-aura-text-faint">Logistics Comms</h4>
                           </div>
                           {[1, 2].map(i => (
                              <div key={i} className="flex gap-3">
                                 <div className="w-6 h-6 rounded bg-aura-surface border border-aura-border flex items-center justify-center text-[10px] font-mono text-aura-text-faint">HQ</div>
                                 <div className="flex-1">
                                    <div className="text-[9px] font-mono text-aura-text-muted uppercase mb-1">Headquarters • 28m ago</div>
                                    <div className="text-[11px] font-sans text-aura-text leading-relaxed bg-aura-surface p-3 rounded border border-aura-border shadow-lg relative">
                                       <div className="absolute top-2 -left-1 w-2 h-2 bg-aura-surface rotate-45 border-l border-b border-aura-border"></div>
                                       Awaiting confirmation from Hub Delta on Trauma Kit availability.
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="mt-8 pt-6 border-t border-aura-border">
                        <Button variant="ghost" className="w-full py-4 text-[9px] tracking-[0.3em] font-mono uppercase text-aura-text-muted hover:text-aura-text border-aura-border hover:bg-aura-surface-hover">
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
