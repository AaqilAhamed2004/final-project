import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { MapPin } from 'lucide-react';
import { formatRequestId } from '../../utils/priorityHelpers';

export default function RequestCard({ request, onBook }) {
  return (
    <Card className="flex flex-col justify-between h-full hover:border-aura-amber/50 transition-colors duration-300">
      <div>
        <div className="flex justify-between items-start mb-5">
          <Badge priority={request.priority} />
          <span className="text-white/50 text-[11px] font-mono font-bold tracking-widest">REQ {formatRequestId(request.id)}</span>
        </div>
        
        <h3 className="text-[22px] font-bold font-sans mb-2 tracking-tight text-white/90 leading-tight">{request.itemName}</h3>
        
        <div className="flex items-center gap-2 text-white/50 text-sm font-sans mb-8">
          <MapPin size={16} />
          {request.location}
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-4 mb-6">
          <img src={request.officerAvatar} alt={request.assignedOfficer} className="w-10 h-10 rounded border border-white/10 bg-[#1C1309]" />
          <div>
            <div className="text-[9px] font-mono tracking-widest uppercase text-white/50 mb-0.5">Assigned Officer</div>
            <div className="text-sm font-sans text-white/90">GN Officer {request.assignedOfficer}</div>
          </div>
        </div>

        <Button className="w-full py-3" onClick={() => onBook(request)}>
          Book This Request
        </Button>
      </div>
    </Card>
  );
}

RequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  onBook: PropTypes.func.isRequired,
};
