import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyRequests, createRequest, updateStatus, getAnalysis } from '../api';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import RequestForm from '../components/gn-officer/RequestForm';
import ActiveLog from '../components/gn-officer/ActiveLog';
import LiveTracker from '../components/gn-officer/LiveTracker';
import PriorityResult from '../components/priority/PriorityResult';
import AnalysisModal from '../components/priority/AnalysisModal';
import { LayoutDashboard, FileStack, Package, Truck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GNOfficerDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modals state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  
  // Mobile responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchMyRequests = async () => {
    try {
      const data = await getMyRequests();
      setRequests(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setError('Failed to sync data with AURA servers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    const interval = setInterval(fetchMyRequests, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRequestSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newRequest = await createRequest(data);
      setSubmittedRequest(newRequest);
      setIsResultModalOpen(true);
      fetchMyRequests();
    } catch (err) {
      alert(err.message || 'Error initializing deployment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus(id, status);
      fetchMyRequests();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleViewAnalysis = async (request) => {
    setIsAnalysisModalOpen(true);
    setIsAnalysisLoading(true);
    setSelectedAnalysis(null);
    try {
      const analysis = await getAnalysis(request._id || request.id);
      setSelectedAnalysis(analysis);
    } catch (err) {
      console.error("Analysis retrieval failed", err);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const navItems = [
    { path: '/dashboard/gn', label: 'Command Center', icon: LayoutDashboard },
    { path: '/requests', label: 'Relief Requests', icon: FileStack },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/logistics', label: 'Logistics', icon: Truck },
  ];


  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const transitCount = requests.filter(r => ['approved', 'ongoing'].includes(r.status)).length;
  const criticalCount = requests.filter(r => r.priority_level === 'Critical').length;

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-white overflow-hidden">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? `${currentUser.role?.replace('_', ' ')}: ${currentUser.full_name || currentUser.name || 'Operator'}` : 'GN Officer'}

        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full overflow-hidden">
        <Navbar 
          title="Relief Operations" 
          user={currentUser} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto grid grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column - Tactical Request Form */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 order-2 lg:order-1">
              <RequestForm onSubmit={handleRequestSubmit} isSubmitting={isSubmitting} />
            </div>

            {/* Right Column - Status Feed */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
              {error && (
                <div className="bg-aura-red/20 border border-aura-red text-white p-3 rounded font-mono text-xs">
                  {error}
                </div>
              )}
              
              {/* Tactical Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <StatCard 
                  title="AWAITING ACTION" 
                  value={isLoading ? '-' : pendingCount.toString()} 
                  colorClass="text-aura-amber"
                  valueColorClass="text-aura-amber"
                  trend="+2 new alerts"
                />
                <StatCard 
                  title="ACTIVE DEPLOYMENTS" 
                  value={isLoading ? '-' : transitCount.toString()} 
                  colorClass="text-blue-400"
                  valueColorClass="text-blue-400"
                  trend="Logistics tracking..."
                />
                <StatCard 
                  title="HIGH RISK ALERTS" 
                  value={isLoading ? '-' : criticalCount.toString()} 
                  colorClass="text-aura-red"
                  valueColorClass="text-aura-red"
                  trend="Immediate intel required"
                />
              </div>

              {/* Active Log - Interactive table */}
              <div className="flex-1">
                <ActiveLog 
                  requests={requests} 
                  onViewDetails={handleViewAnalysis}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>

              {/* Live Tracker - Placeholder for logistics */}
              <LiveTracker />
            </div>

          </div>
        </main>
      </div>

      {/* Result Modal - After creation */}
      <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)}>
        <PriorityResult requestData={submittedRequest} onClose={() => setIsResultModalOpen(false)} />
      </Modal>

      {/* Analysis Modal - Intelligence Feed */}
      <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} className="max-w-2xl">
        <AnalysisModal analysis={selectedAnalysis} isLoading={isAnalysisLoading} />
      </Modal>
    </div>
  );
}
