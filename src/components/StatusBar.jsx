import React, { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';

const StatusBar = () => {
  const [status, setStatus] = useState({ message: 'Ready to record', type: 'info' });

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.STATUS_UPDATE, (newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    switch (status.type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={`${getStatusColor()} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all`}>
      {status.message}
    </div>
  );
};

export default StatusBar;
