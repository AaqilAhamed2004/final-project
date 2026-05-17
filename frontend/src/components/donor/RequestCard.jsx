import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { MapPin } from 'lucide-react';
import { formatRequestId } from '../../utils/priorityHelpers';

export default function RequestCard({ request, onBook }) {
  // Use _id for displaying, fallback to id for old mock data just in case
  const reqId = request._id || request.id;
  const itemName = request.supply_type || request.itemName || (request.items && request.items[0]?.item_name) || 'Relief Request';
  // priority_level is written directly on the request document by the AI engine
  const priority = request.priority_level || null;

  const location = request.location_name || request.location;
  const assignedOfficer = request.gn_officer_id || request.assignedOfficer || 'System';
  const officerAvatar = request.officerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedOfficer}&backgroundColor=1C1309`;

  return (
    <Card className="flex flex-col justify-between h-full hover:border-aura-amber/50 transition-colors duration-300">
      <div>
        <div className="flex justify-between items-start mb-5">
          <Badge priority={priority} />
          <span className="text-aura-text-muted text-[11px] font-mono font-bold tracking-widest" title={reqId}>REQ {formatRequestId(reqId?.slice(-6) || 'N/A')}</span>
        </div>
        
        <h3 className="text-[22px] font-bold font-sans mb-2 tracking-tight text-aura-text leading-tight line-clamp-2" title={itemName}>{itemName}</h3>
        
        <div className="flex items-center gap-2 text-aura-text-muted text-sm font-sans mb-8 w-full">
          <MapPin size={16} className="shrink-0" />
          <span className="truncate" title={location}>{location}</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-4 mb-6">
          <img src={officerAvatar} alt={assignedOfficer} className="w-10 h-10 rounded border border-aura-border bg-aura-surface" />
          <div>
            <div className="text-[9px] font-mono tracking-widest uppercase text-aura-text-muted mb-0.5">Assigned Officer</div>
            <div className="text-sm font-sans text-aura-text truncate max-w-[120px]" title={assignedOfficer}>GN Officer {assignedOfficer.slice(-6)}</div>
          </div>
        </div>

        {request.status === 'ongoing' ? (
          <Button 
            variant="secondary" 
            className="w-full py-3 opacity-80 border-emerald-500/50 text-emerald-400 cursor-not-allowed hover:bg-transparent"
            disabled
          >
            Ongoing Contribution
          </Button>
        ) : request.status === 'completed' ? (
          <Button 
            variant="secondary" 
            className="w-full py-3 opacity-40 border-aura-border text-aura-text-muted cursor-not-allowed hover:bg-transparent"
            disabled
          >
            Completed
          </Button>
        ) : (
          <Button className="w-full py-3" onClick={() => onBook(request)}>
            Book This Request
          </Button>
        )}
      </div>
    </Card>
  );
}

RequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  onBook: PropTypes.func.isRequired,
};
