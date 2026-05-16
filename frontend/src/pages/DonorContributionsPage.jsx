import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { getMyContributions } from '../api';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Download, ExternalLink, Package, Heart, Users, Calendar, Clock, ChevronLeft, ChevronRight, Filter, CheckCircle2 } from 'lucide-react';


export default function DonorContributionsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyContributions();
        setContributions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Contribution Value', value: '$1,250', trend: '+12.4% vs previous month', icon: Package },
    { label: 'Requests Supported', value: contributions.length.toString(), trend: 'Sectors: Medical, Food, Utility', icon: Heart },
    { label: 'Impact Estimate', value: (contributions.length * 2).toString(), trend: 'Verified Logistical Reach', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-aura-bg flex flex-col font-sans text-white overflow-x-hidden">
      <Navbar 
        title="ReliefOps Command" 
        user={currentUser}
        onLogout={handleLogout}
      >
        <Link to="/public" className="hover:text-aura-amber cursor-pointer transition-colors whitespace-nowrap">Relief Board</Link>
        <span className="text-aura-amber border-b-2 border-aura-amber pb-1 cursor-pointer font-bold whitespace-nowrap">My Contributions</span>
        <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Impact Map</span>
      </Navbar>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-8 space-y-8 lg:space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold font-sans text-white mb-2 tracking-tight">My Contributions & Giving History</h1>
          <p className="text-white/40 text-sm lg:text-base max-w-3xl leading-relaxed">
            Real-time operational overview of your logistical support and impact metrics across active relief sectors.
          </p>
        </div>

        {/* System Time Banner */}
        <div className="flex justify-end">
           <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-sm flex items-center gap-3">
              <Calendar size={16} className="text-aura-amber" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                System Time: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} // {new Date().getHours()}:{new Date().getMinutes()} UTC
              </span>
           </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-[#140D07] border-white/5 border-l-4 border-l-aura-amber p-6 lg:p-8 hover:bg-white/[0.02] transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white/40">{stat.label}</span>
                <stat.icon size={20} className="text-aura-amber/40 group-hover:text-aura-amber transition-colors" />
              </div>
              <div className="text-3xl lg:text-5xl font-bold font-sans text-aura-amber mb-2">{stat.value}{i === 2 && <span className="text-sm ml-2 text-white/30 uppercase tracking-widest font-mono">Lives</span>}</div>
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                 {i === 0 && <span className="text-blue-400">↗</span>}
                 {stat.trend}
              </div>
            </Card>
          ))}
        </div>

        {/* Giving History Table */}
        <Card className="p-0 border-white/5 bg-[#0D0905] overflow-hidden">
           <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-lg font-bold font-sans tracking-tight">Giving History</h2>
                 <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest">Records: {contributions.length}/{contributions.length}</span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest whitespace-nowrap">Filter by Type:</span>
                 <div className="bg-[#1A140F] border border-white/10 px-3 py-2 rounded flex items-center justify-between gap-8 cursor-pointer hover:border-aura-amber/40 transition-colors w-full sm:w-48">
                    <span className="text-[10px] font-mono text-white/60 uppercase">All Relief Types</span>
                    <Filter size={12} className="text-white/30" />
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                 <thead>
                    <tr className="bg-white/[0.01] border-b border-white/5">
                       {['Date', 'Request ID', 'Relief Type', 'Contribution Details', 'Current Status', 'Action'].map(h => (
                          <th key={h} className="text-left py-5 px-6 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.03]">
                    {isLoading ? (
                       <tr>
                          <td colSpan="6" className="py-20 text-center text-white/20 font-mono text-xs tracking-widest animate-pulse">Synchronizing Tactical Feed...</td>
                       </tr>
                    ) : contributions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-20 text-center text-white/20 font-mono text-xs tracking-widest uppercase">No logistical support records found in your sector.</td>
                       </tr>
                    ) : contributions.map((item) => (
                       <tr key={item.booking_id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="py-5 px-6 text-[11px] font-mono text-white/60 uppercase">
                             {new Date(item.booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </td>
                          <td className="py-5 px-6 text-[11px] font-mono font-bold text-aura-amber tracking-widest">#REQ-{item.request_id?.slice(-4)}</td>
                          <td className="py-5 px-6">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-aura-red"></div>
                                <span className="bg-aura-red/10 border border-aura-red/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-aura-red uppercase tracking-widest">
                                   {item.items?.[0]?.category || 'Medicine'}
                                </span>
                             </div>
                          </td>
                          <td className="py-5 px-6 text-sm font-sans text-white/80">
                             {item.items?.[0]?.item_name} x{item.items?.[0]?.quantity_needed || 1} ({item.items?.[0]?.category})
                          </td>
                          <td className="py-5 px-6">
                             <div className="flex items-center gap-2">
                                {item.status === 'ongoing' ? (
                                   <>
                                      <Clock size={14} className="text-blue-400 animate-pulse" />
                                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">In Transit</span>
                                   </>
                                ) : (
                                   <>
                                      <CheckCircle2 size={14} className="text-green-500" />
                                      <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">Complete</span>
                                   </>
                                )}
                             </div>
                          </td>
                          <td className="py-5 px-6">
                             <button className="text-white/20 hover:text-white transition-colors" title="View Transaction Audit">
                                <ExternalLink size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Showing 1-5 of {contributions.length} Contributions</div>
              <div className="flex gap-2">
                 <button className="p-2 border border-white/5 rounded hover:bg-white/5 transition-colors text-white/20"><ChevronLeft size={16}/></button>
                 <button className="p-2 border border-white/5 rounded hover:bg-white/5 transition-colors text-white/20"><ChevronRight size={16}/></button>
              </div>
           </div>
        </Card>

        {/* Bottom Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
           <Card className="bg-[#140D07] border-white/5 p-8 flex gap-6 group hover:bg-[#1A140F] transition-all">
              <div className="w-24 h-24 bg-black rounded border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-aura-amber/40 transition-colors overflow-hidden">
                 <div className="text-[8px] font-mono text-white/10 uppercase tracking-tighter text-center">Scan_Livestream<br/>Hub_01_West</div>
              </div>
              <div>
                 <h3 className="text-lg font-bold font-sans mb-2">Logistics Tracking Enabled</h3>
                 <p className="text-xs text-white/40 leading-relaxed mb-4">
                    Your latest contribution (#REQ-{contributions[0]?.request_id?.slice(-4) || '####'}) is currently being processed through the central distribution hub. Detailed geolocation tracking will be available once delivery drone 09 is airborne.
                 </p>
                 <button className="text-[10px] font-mono text-aura-amber font-bold tracking-widest uppercase flex items-center gap-2 hover:underline">
                    View Active Hub Map <ChevronRight size={12}/>
                 </button>
              </div>
           </Card>

           <Card className="bg-[#140D07] border-white/5 p-8 flex flex-col items-center justify-center text-center group hover:bg-[#1A140F] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Users size={80} />
              </div>
              <div className="w-16 h-16 rounded border border-white/10 flex items-center justify-center mb-4 group-hover:border-aura-amber/40 transition-colors">
                 <Download size={24} className="text-aura-amber" />
              </div>
              <div className="text-[8px] font-mono text-aura-amber tracking-[0.3em] uppercase font-bold mb-4">Lvl 4 Donor</div>
              <h3 className="text-lg font-bold font-sans mb-2">Impact Certificate Ready</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-6 max-w-xs mx-auto">
                 Your contributions have surpassed the 20-life impact milestone. Your verified impact audit for Q3 2026 is now available for download and professional verification.
              </p>
              <Button className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-black font-bold uppercase tracking-[0.2em] text-[10px]">
                 Download Audit .PDF
              </Button>
           </Card>
        </div>
      </main>
    </div>
  );
}
