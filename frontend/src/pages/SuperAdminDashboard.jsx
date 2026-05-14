import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getInventory, getAllRequests, addInventoryItem, deleteInventoryItem, updateInventoryItem } from '../api';
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
  const [supplies, setSupplies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [invData, reqData] = await Promise.all([
        getInventory(),
        getAllRequests()
      ]);
      setSupplies(invData);
      setRequests(reqData);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(intervalId);
  }, []);

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

  const handleAddSupply = async (newSupplyData) => {
    try {
      await addInventoryItem({
        item_name: newSupplyData.name,
        category: newSupplyData.category,
        quantity: parseInt(newSupplyData.quantity, 10),
        unit: 'units'
      });
      fetchData(); // refresh
    } catch (err) {
      alert(err.message || 'Failed to add supply');
    }
  };

  const handleDeleteSupply = async (supply) => {
    try {
      await deleteInventoryItem(supply._id || supply.id);
      fetchData(); // refresh
    } catch (err) {
      alert(err.message || 'Failed to delete supply');
    }
  };

  const handleEditSupply = async (supply, updatedFields) => {
    try {
      await updateInventoryItem(supply._id || supply.id, updatedFields);
      fetchData(); // refresh
    } catch (err) {
      alert(err.message || 'Failed to update supply');
    }
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
            
            {error && (
              <div className="bg-aura-red/20 border border-aura-red text-white p-4 rounded mb-6 font-mono text-sm">
                SYSTEM ERROR: {error}
              </div>
            )}

            <KPIRow supplies={supplies} requests={requests} />

            <div className="grid grid-cols-12 gap-6 h-[500px] mb-6">
              {/* Main Column */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                {/* Inventory Panel */}
                <div className="flex-1 flex flex-col border border-white/5 rounded-lg p-6 bg-[#140D07] relative">
                  {isLoading && supplies.length === 0 && (
                    <div className="absolute inset-0 bg-[#140D07]/80 flex justify-center items-center z-10">
                      <div className="w-8 h-8 rounded-full border-2 border-aura-amber border-t-transparent animate-spin"></div>
                    </div>
                  )}
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
                <IntelStream supplies={supplies} requests={requests} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[280px]">
              <div className="col-span-12 md:col-span-6 xl:col-span-4">
                <PriorityDonut requests={requests} />
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-4">
                <GlobalLogistics requests={requests} />
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
