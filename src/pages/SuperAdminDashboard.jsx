import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supplies as initialSupplies } from '../data/supplies';
import { requests } from '../data/requests';
import { intelFeed } from '../data/intelFeed';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import KPIRow from '../components/super-admin/KPIRow';
import InventoryTable from '../components/super-admin/InventoryTable';
import AddSupplyModal from '../components/super-admin/AddSupplyModal';
import PriorityDonut from '../components/super-admin/PriorityDonut';
import IntelStream from '../components/super-admin/IntelStream';
import GlobalLogistics from '../components/super-admin/GlobalLogistics';
import Button from '../components/common/Button';
import { LayoutDashboard, Package, FileStack, Truck, Users, Plus } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [supplies, setSupplies] = useState(initialSupplies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleAddSupply = (newSupply) => {
    setSupplies([newSupply, ...supplies]);
  };

  const handleDeleteSupply = (supply) => {
    setSupplies(supplies.filter(s => s.id !== supply.id));
  };

  const handleEditSupply = (supply) => {
    console.log('Edit supply', supply);
  };

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-white">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? `${currentUser.name}: Prime` : 'Admin'}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar 
          title="Super Admin Dashboard" 
          user={currentUser} 
          badgeText="CRITICAL OPS ACTIVE"
          badgeColorClass="border-white/20 text-white/70"
        />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            
            <KPIRow supplies={supplies} requests={requests} />

            <div className="grid grid-cols-12 gap-6 h-[500px] mb-6">
              {/* Main Column */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                {/* Inventory Panel */}
                <div className="flex-1 flex flex-col border border-white/5 rounded-lg p-6 bg-[#140D07]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold font-sans mb-1 tracking-tight">Supply Inventory</h2>
                      <p className="text-white/50 text-sm font-sans">Real-time status of disaster relief stock</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="py-2.5 px-6">
                      <Plus size={16} />
                      Add New Supply
                    </Button>
                  </div>
                  
                  <InventoryTable 
                    supplies={supplies} 
                    onEdit={handleEditSupply}
                    onDelete={handleDeleteSupply}
                  />
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="col-span-12 xl:col-span-4 flex flex-col">
                <IntelStream intelData={intelFeed} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[280px]">
              <div className="col-span-12 md:col-span-6 xl:col-span-4">
                <PriorityDonut requests={requests} />
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-4">
                <GlobalLogistics />
              </div>
              <div className="col-span-12 xl:col-span-4 flex justify-end items-end pb-2">
                 <Button variant="secondary" className="w-full py-4 text-xs tracking-widest text-white/70 border-white/10 hover:border-white/30 bg-[#140D07] hover:bg-[#1A140F] hover:text-white transition-colors uppercase font-mono">
                   View Historical Analytics
                 </Button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <AddSupplyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddSupply} 
      />
    </div>
  );
}
