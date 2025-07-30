import React, { useState, useRef, useEffect } from 'react';
import { chatWithClaude } from '../services/claudeService';
import { eventBus, EVENTS } from '../utils/eventBus';

const ChatPanel = ({ isOpen, onClose, noteContent, noteTitle, chatHistory, onChatUpdate }) => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMessage];
    onChatUpdate(updatedHistory);
    setMessage('');
    setIsProcessing(true);

    try {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Thinking...', 
        type: 'info' 
      });

      const response = await chatWithClaude(noteContent, noteTitle, updatedHistory);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      onChatUpdate([...updatedHistory, assistantMessage]);
      
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Response received', 
        type: 'success' 
      });
    } catch (error) {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: error.message || 'Failed to get response', 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Chat about this note</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">Ask questions or discuss this note.</p>
              <p className="text-xs mt-2">The AI has access to the note content.</p>
            </div>
          )}
          
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-white text-black' 
                  : 'bg-gray-800 text-white'
              } rounded-lg p-3`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this note..."
              className="flex-1 bg-black text-white placeholder-gray-600 border border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:border-white transition-colors"
              rows="2"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className={`px-4 py-2 border transition-all ${
                !message.trim() || isProcessing
                  ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                  : 'border-white text-white hover:bg-white hover:text-black'
              }`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
