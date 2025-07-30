import React, { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';

const StatusBar = () => {
  const [status, setStatus] = useState({ message: 'Ready', type: 'info' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.STATUS_UPDATE, (newStatus) => {
      setStatus(newStatus);
      setIsVisible(true);
      
      // Auto-hide after 3 seconds for non-error messages
      if (newStatus.type !== 'error') {
        setTimeout(() => setIsVisible(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    switch (status.type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`${getStatusColor()} text-sm font-medium transition-all`}>
      {status.message}
    </div>
  );
};

export default StatusBar;
