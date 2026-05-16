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
import { useNavigate } from 'react-router-dom';

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
      await bookRequest(selectedRequest._id || selectedRequest.id, `Booked by donor ${currentUser?.name || 'Anonymous'}`);
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
    <div className="min-h-screen bg-aura-bg flex flex-col font-sans text-white">
      <Navbar 
        title="AURA" 
        user={currentUser ? {
          ...currentUser,
          // Fallback if avatar is missing
          avatar: currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Donor&backgroundColor=1C1309'
        } : null}
        onLogout={handleLogout}
      >
        <span className="text-aura-amber border-b-2 border-aura-amber pb-1 cursor-pointer font-bold">Relief Board</span>
        <span className="hover:text-white cursor-pointer transition-colors">My Contributions</span>
        <span className="hover:text-white cursor-pointer transition-colors">Impact Map</span>
      </Navbar>
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-8 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans text-aura-amber mb-2 tracking-tight">Live Relief Requests Board</h1>
          <p className="text-white/70 max-w-3xl leading-relaxed">
            Real-time tactical display of civilian and operational needs across active relief zones. Coordinate your impact directly with Ground Network Officers.
          </p>
        </div>

        {error && (
          <div className="bg-aura-red/20 border border-aura-red text-white p-4 rounded mb-6 font-mono text-sm">
            SYSTEM ERROR: {error}
          </div>
        )}

        <StatsStrip requests={liveRequests} />
        
        <FilterBar filters={filters} onFilterChange={handleFilterChange} onRefresh={fetchBoardData} />


        {isLoading && liveRequests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-aura-amber border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredRequests.slice(0, displayedCount).map(req => (
                <RequestCard 
                  key={req._id || req.id} 
                  request={req} 
                  onBook={handleBookRequest}
                />
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center text-white/40 py-20 font-mono text-sm border border-white/5 bg-[#140D07] rounded mt-6">
                NO ACTIVE REQUESTS MATCHING FILTERS
              </div>
            )}

            {displayedCount < filteredRequests.length && (
              <div className="flex justify-center mt-12 mb-8">
                <Button 
                  variant="secondary" 
                  className="py-3 px-8 text-xs text-white/70 border-white/20 hover:text-white hover:bg-white/5"
                  onClick={() => setDisplayedCount(prev => prev + 4)}
                >
                  Load More Tactical Feed
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-aura-amber/10 flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-aura-amber" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm Contribution</h2>
          <p className="text-white/70 mb-6 text-sm">
            Are you sure you want to book <span className="text-aura-amber font-bold">{selectedRequest?.supply_type || selectedRequest?.itemName}</span>? 
            Ground Officer {selectedRequest?.gn_officer_id?.slice(-6) || selectedRequest?.assignedOfficer} will be notified immediately.
          </p>
          <div className="flex w-full gap-4">
            <Button variant="secondary" className="flex-1 py-3" onClick={() => setIsModalOpen(false)} disabled={isBooking}>Cancel</Button>
            <Button className="flex-1 py-3" onClick={handleConfirmBooking} disabled={isBooking}>
              {isBooking ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
