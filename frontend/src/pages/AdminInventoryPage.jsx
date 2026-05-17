import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getInventory, addInventoryItem, deleteInventoryItem, updateInventoryItem, bookInventoryItem } from '../api';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { LayoutDashboard, Package, FileStack, Truck, Users, Plus, Search, Filter, Calendar, MapPin, Edit2, Trash2, History, Bookmark } from 'lucide-react';
import AddSupplyModal from '../components/super-admin/AddSupplyModal';

export default function AdminInventoryPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [supplies, setSupplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = currentUser?.role;

  const fetchSupplies = async () => {
    try {
      setIsLoading(true);
      const data = await getInventory();
      setSupplies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = async (item) => {
    const newQtyStr = prompt(`Enter new quantity for ${item.item_name}:`, item.quantity);
    if (newQtyStr === null) return;
    const newQty = parseInt(newQtyStr, 10);
    if (isNaN(newQty)) {
      alert("Please enter a valid number");
      return;
    }
    try {
      await updateInventoryItem(item._id, { quantity: newQty });
      await fetchSupplies();
    } catch (err) {
      alert("Failed to update item: " + err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.item_name} from inventory?`)) return;
    try {
      await deleteInventoryItem(item._id);
      await fetchSupplies();
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  const handleBookSupply = async (item) => {
    const qtyStr = prompt(`Enter quantity to book from ${item.item_name} (Available: ${item.quantity}):`);
    if (qtyStr === null) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity greater than zero.");
      return;
    }
    if (qty > item.quantity) {
      alert(`Requested quantity exceeds available stock of ${item.quantity}.`);
      return;
    }
    try {
      await bookInventoryItem(item._id, qty);
      alert(`Successfully booked ${qty} units of ${item.item_name}!`);
      await fetchSupplies();
    } catch (err) {
      alert("Failed to book item: " + err.message);
    }
  };

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

  const filteredSupplies = supplies.filter(s => {
    const matchesSearch = s.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const itemDate = s.expiration_date || '2026-12-31';
    const matchesStart = !startDate || itemDate >= startDate;
    const matchesEnd = !endDate || itemDate <= endDate;
    
    return matchesSearch && matchesCategory && matchesStart && matchesEnd;
  });

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
          title="Comprehensive Inventory Deep Dive" 
          user={currentUser} 
          badgeText="CRITICAL OPS ACTIVE"
          badgeColorClass="border-aura-red text-aura-red"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            
            {/* Left Column - Main Inventory Table */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-sans tracking-tight text-aura-text">Advanced Supply Inventory Control</h2>
                  <p className="text-aura-text-muted text-sm font-sans mt-1">Real-time status of multi-hub relief stock and condition auditing.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto py-2.5 px-6 text-xs uppercase tracking-widest font-bold">
                  <Plus size={16} />
                  Add New Supply
                </Button>
              </div>

              {/* Filters / Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-aura-surface border border-aura-border p-4 rounded-lg">
                <div className="relative col-span-1 md:col-span-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-faint" />
                  <input 
                    type="text" 
                    placeholder="Search supplies..." 
                    className="w-full bg-aura-bg border border-aura-border rounded px-10 py-2.5 text-xs font-mono focus:border-aura-accent/40 outline-none transition-colors text-aura-text placeholder:text-aura-text-faint"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-faint" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-aura-bg border border-aura-border rounded pl-10 pr-8 py-2.5 text-xs font-mono text-aura-text-muted uppercase tracking-widest focus:border-aura-accent/40 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-aura-bg">All Categories</option>
                    <option value="medicine" className="bg-aura-bg">Medicine</option>
                    <option value="food" className="bg-aura-bg">Food</option>
                    <option value="shelter" className="bg-aura-bg">Shelter</option>
                    <option value="other" className="bg-aura-bg">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aura-text-faint text-[10px]">▼</div>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-2 border border-aura-border rounded px-3 py-1 bg-aura-bg">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-aura-text-faint" />
                    <span className="text-[10px] font-mono text-aura-text-muted uppercase tracking-widest">Expires:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
                    <span className="text-[9px] font-mono text-aura-text-faint uppercase">From</span>
                    <input 
                      type="date" 
                      className="bg-aura-surface border border-aura-border rounded px-2 py-1 text-xs font-mono text-aura-text focus:border-aura-accent/30 focus:outline-none cursor-pointer"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-[9px] font-mono text-aura-text-faint uppercase">To</span>
                    <input 
                      type="date" 
                      className="bg-aura-surface border border-aura-border rounded px-2 py-1 text-xs font-mono text-aura-text focus:border-aura-accent/30 focus:outline-none cursor-pointer"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    {(startDate || endDate) && (
                      <button 
                        onClick={() => { setStartDate(''); setEndDate(''); }} 
                        className="text-[9px] font-mono text-aura-red hover:underline uppercase ml-auto"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Table */}
              <Card className="flex-1 p-0 overflow-hidden shadow-aura-card">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-aura-border bg-aura-surface">
                        {['Supply ID', 'Name', 'Category', 'Warehouse/Storage', 'Specific Location', 'Total Quantity', 'Condition', 'Expiration Date', 'Last Audit', 'Actions'].map(h => (
                          <th key={h} className="text-left py-5 px-6 text-[10px] font-mono font-bold text-aura-text-faint uppercase tracking-[0.2em]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-aura-border">
                      {filteredSupplies.map((item) => (
                        <tr key={item._id} className="hover:bg-aura-surface-hover transition-colors group">
                          <td className="py-5 px-6">
                            <div className="text-[10px] font-mono font-bold text-aura-accent tracking-widest uppercase">SR-{item._id?.slice(-4)}-A</div>
                            <div className="text-[8px] font-mono text-aura-text-faint mt-0.5">DETAILED</div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="text-sm font-sans font-bold text-aura-text">{item.item_name}</div>
                          </td>
                          <td className="py-5 px-6">
                             <span className={`px-2 py-1 rounded-sm text-[8px] font-mono font-bold uppercase tracking-widest border ${
                               item.category === 'medicine' ? 'bg-aura-red/10 border-aura-red/30 text-aura-red' :
                               item.category === 'food' ? 'bg-aura-blue/10 border-aura-blue/30 text-aura-blue' :
                               item.category === 'shelter' ? 'bg-aura-accent/10 border-aura-accent/30 text-aura-accent' :
                               'bg-aura-surface border-aura-border text-aura-text-muted'
                             }`}>
                               {item.category}
                             </span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="text-[11px] font-sans text-aura-text-muted">{item.warehouse || 'Field Depot'}</div>
                            <div className="text-[9px] font-mono text-aura-text-faint uppercase mt-0.5">{item.location}</div>
                          </td>
                          <td className="py-5 px-6 text-[10px] font-mono text-aura-text-faint">
                            Bin {item.bin_location || '####'}
                          </td>
                          <td className="py-5 px-6">
                            <div className={`text-xs font-mono font-bold ${item.quantity < 1000 ? 'text-aura-red' : 'text-aura-text'}`}>
                              {item.quantity.toLocaleString()} Units
                            </div>
                            {item.quantity < 1000 && <div className="text-[8px] font-mono text-aura-red/80 uppercase mt-0.5">(CRITICAL)</div>}
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-[10px] font-mono text-aura-text-muted border border-aura-border px-2 py-0.5 rounded-sm bg-aura-surface">{item.condition || 'New'}</span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="text-[10px] font-mono text-aura-text-muted">{item.expiration_date || '2026-12-31'}</div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="text-[10px] font-mono text-aura-text-faint uppercase tracking-tighter">Last Audit</div>
                            <div className="text-[11px] font-sans text-aura-text-muted">{item.last_audit || '2025-10-15'}</div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleBookSupply(item)} className="text-aura-text-muted hover:text-aura-accent transition-colors" title="Book Supply"><Bookmark size={14} /></button>
                              <button onClick={() => handleEdit(item)} className="text-aura-text-muted hover:text-aura-text transition-colors" title="Edit Item"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete(item)} className="text-aura-text-muted hover:text-aura-red transition-colors" title="Delete Item"><Trash2 size={14} /></button>
                              <button className="text-aura-text-muted hover:text-aura-text transition-colors opacity-40 hover:opacity-100" title="Audit History"><History size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column - Audit Log Sidebar */}
            <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
               <Card className="flex flex-col bg-aura-bg border-aura-border p-6 h-full min-h-[600px]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-bold font-sans tracking-tight text-aura-text">Stock Movement & Audit Log</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-aura-red animate-pulse"></div>
                        <span className="text-[9px] font-mono text-aura-red tracking-[0.2em] uppercase font-bold">Live Stream</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="flex gap-4 group cursor-pointer">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-aura-accent/20 border border-aura-accent/40 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-aura-accent"></div>
                          </div>
                          <div className="w-px h-full bg-aura-border"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-[10px] font-mono text-aura-text-faint uppercase mb-1">14:32: GN Officer Prime moved</div>
                          <div className="text-[11px] font-sans font-bold text-aura-text group-hover:text-aura-accent transition-colors">500 Trauma Kits to Hub Delta</div>
                          <div className="text-[9px] font-mono text-aura-text-faint uppercase mt-1 tracking-widest">Inventory ID: SR-9901-A</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-aura-border">
                    <Button variant="ghost" className="w-full py-4 text-[9px] tracking-[0.3em] font-mono uppercase text-aura-text-faint hover:text-aura-text border-aura-border hover:bg-aura-surface-hover">
                      Export Audit Manifest
                    </Button>
                  </div>
               </Card>
            </div>

          </div>
        </main>
      </div>

      <AddSupplyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={async (data) => {
          await addInventoryItem(data);
          fetchSupplies();
        }} 
      />
    </div>
  );
}
