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
  
  // Sidebar responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    const intervalId = setInterval(fetchData, 30000);
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
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add supply');
    }
  };

  const handleDeleteSupply = async (supply) => {
    try {
      await deleteInventoryItem(supply._id || supply.id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete supply');
    }
  };

  const handleEditSupply = async (supply, updatedFields) => {
    try {
      await updateInventoryItem(supply._id || supply.id, updatedFields);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update supply');
    }
  };

  return (
    <div className="min-h-screen bg-aura-bg flex font-sans text-aura-text">
      <Sidebar 
        navItems={navItems} 
        activeSessionText={currentUser ? `Admin: ${currentUser.full_name || currentUser.name || 'Prime'}` : 'Admin'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full">
        <Navbar 
          title="Super Admin Dashboard" 
          user={currentUser} 
          badgeText="CRITICAL OPS ACTIVE"
          badgeColorClass="border-aura-border text-aura-text-muted"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
            
            {error && (
              <div className="bg-aura-red/20 border border-aura-red text-aura-text p-4 rounded-lg mb-6 font-mono text-sm">
                SYSTEM ERROR: {error}
              </div>
            )}

            <KPIRow supplies={supplies} requests={requests} />

            <div className="grid grid-cols-12 gap-6 mb-6">
              {/* Main Column */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                {/* Inventory Panel */}
                <div className="flex flex-col border border-aura-border rounded-lg p-4 lg:p-6 bg-aura-card relative min-h-[400px]">
                  {isLoading && supplies.length === 0 && (
                    <div className="absolute inset-0 bg-aura-card/90 flex justify-center items-center z-10 rounded-lg">
                      <div className="w-8 h-8 rounded-full border-2 border-aura-border border-t-aura-accent animate-spin" />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold font-sans mb-1 tracking-tight text-aura-text">Supply Inventory</h2>
                      <p className="text-aura-text-muted text-xs lg:text-sm font-sans">Real-time status of disaster relief stock</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto py-2.5 px-6 text-xs uppercase tracking-widest">
                      <Plus size={16} />
                      Add New Supply
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto">
                    <InventoryTable 
                      supplies={supplies} 
                      onEdit={handleEditSupply}
                      onDelete={handleDeleteSupply}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="col-span-12 xl:col-span-4 h-full">
                <IntelStream supplies={supplies} requests={requests} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                <PriorityDonut requests={requests} />
              </div>
              <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                <GlobalLogistics requests={requests} />
              </div>
              <div className="col-span-12 xl:col-span-4 flex justify-end items-end pb-2">
                <Button variant="ghost" className="w-full py-5 text-[10px] tracking-[0.3em] uppercase font-mono shadow-lg">
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
