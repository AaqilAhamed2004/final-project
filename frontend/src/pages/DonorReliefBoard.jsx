import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { getPublicBoard, bookRequest } from '../api';
import Navbar from '../components/common/Navbar';
import FilterBar from '../components/donor/FilterBar';
import StatsStrip from '../components/donor/StatsStrip';
import RequestCard from '../components/donor/RequestCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { CheckCircle2, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';




export default function DonorReliefBoard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [liveRequests, setLiveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { filters, handleFilterChange, filteredRequests } = useRequestFilter(liveRequests);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      const data = await getPublicBoard();
      setLiveRequests(data);
    } catch (err) {
      setError('Failed to fetch tactical data feed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
    const intervalId = setInterval(fetchBoardData, 30000); // auto-refresh 30s
    return () => clearInterval(intervalId);
  }, []);

  const handleBookRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRequest) return;
    setIsBooking(true);
    try {
      await bookRequest(selectedRequest._id || selectedRequest.id, `Booked by donor ${currentUser?.full_name || currentUser?.name || 'Anonymous'}`);
      await fetchBoardData(); // refresh the board
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.message || 'Failed to confirm booking.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-aura-bg flex flex-col font-sans text-white overflow-x-hidden">
      <Navbar 
        title="AURA" 
        user={currentUser ? {
          ...currentUser,
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}&backgroundColor=1C1309`
        } : null}
        onLogout={handleLogout}
      >
        <span className="text-aura-amber border-b-2 border-aura-amber pb-1 cursor-pointer font-bold whitespace-nowrap">Relief Board</span>
        <Link to="/contributions" className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">My Contributions</Link>
        <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Impact Map</span>
      </Navbar>

      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-8 relative">
        <div className="mb-6 lg:mb-10">
          <h1 className="text-2xl lg:text-4xl font-bold font-sans text-aura-amber mb-2 tracking-tight">Live Relief Requests Board</h1>
          <p className="text-white/60 text-sm lg:text-base max-w-3xl leading-relaxed">
            Real-time tactical display of civilian and operational needs. Coordinate your impact directly with Ground Network Officers.
          </p>
        </div>

        {error && (
          <div className="bg-aura-red/20 border border-aura-red text-white p-4 rounded mb-6 font-mono text-xs lg:text-sm">
            SYSTEM ERROR: {error}
          </div>
        )}

        <StatsStrip requests={liveRequests} />
        
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 mb-6 lg:mb-8">
            <FilterBar filters={filters} onFilterChange={handleFilterChange} onRefresh={fetchBoardData} />
        </div>


        {isLoading && liveRequests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-aura-amber border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredRequests.slice(0, displayedCount).map(req => (
                <RequestCard 
                  key={req._id || req.id} 
                  request={req} 
                  onBook={handleBookRequest}
                />
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center text-white/40 py-20 font-mono text-[10px] lg:text-xs tracking-widest border border-white/5 bg-[#140D07]/50 rounded mt-6 uppercase">
                NO ACTIVE REQUESTS MATCHING FILTERS
              </div>
            )}

            {displayedCount < filteredRequests.length && (
              <div className="flex justify-center mt-12 mb-8 px-4">
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto py-3.5 px-10 text-[10px] tracking-[0.2em] uppercase text-white/60 border-white/10 hover:text-white hover:bg-white/5 font-mono"
                  onClick={() => setDisplayedCount(prev => prev + 4)}
                >
                  Load More Tactical Feed
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md w-[90%] mx-auto">
        <div className="p-6 lg:p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-aura-amber/10 flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-aura-amber" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold mb-2">Confirm Contribution</h2>
          <p className="text-white/60 mb-6 text-sm">
            Are you sure you want to book <span className="text-aura-amber font-bold">{selectedRequest?.supply_type || selectedRequest?.item_name}</span>? 
            Ground Officer notifications will be dispatched immediately.
          </p>
          <div className="flex flex-col sm:flex-row w-full gap-3 lg:gap-4">
            <Button variant="secondary" className="flex-1 py-3 order-2 sm:order-1" onClick={() => setIsModalOpen(false)} disabled={isBooking}>Cancel</Button>
            <Button className="flex-1 py-3 order-1 sm:order-2" onClick={handleConfirmBooking} disabled={isBooking}>
              {isBooking ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
