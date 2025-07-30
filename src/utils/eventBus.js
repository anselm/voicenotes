// Simple event bus for pub/sub pattern
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
}

export const eventBus = new EventBus();

// Event types
export const EVENTS = {
  RECORDING_STARTED: 'recording:started',
  RECORDING_STOPPED: 'recording:stopped',
  RECORDING_PAUSED: 'recording:paused',
  RECORDING_RESUMED: 'recording:resumed',
  TRANSCRIPTION_UPDATE: 'transcription:update',
  TRANSCRIPTION_FINAL: 'transcription:final',
  NOTE_SAVED: 'note:saved',
  NOTE_DELETED: 'note:deleted',
  STATUS_UPDATE: 'status:update',
  ERROR: 'error',
};
