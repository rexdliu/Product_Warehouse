import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Maximize2,
  Minimize2,
  Mic,
  Paperclip,
  Move,
  RotateCcw
} from 'lucide-react';
import { useAIStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import aiIcon from '@/assets/chatBot.svg';

interface DraggableAIProps {
  hidden?: boolean;
}

export const DraggableAI: React.FC<DraggableAIProps> = ({ hidden = false }) => {
  const { t } = useTranslation();
  const { 
    isOpen, 
    isLoading, 
    messages, 
    suggestions, 
    toggleChat, 
    addMessage, 
    setLoading 
  } = useAIStore();
  
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [size, setSize] = useState({ width: 384, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage(input, 'user');
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your current inventory data, I've identified 3 items with critical low stock levels that need immediate attention.",
        "I've analyzed your warehouse traffic patterns and recommend relocating high-demand items to zones A1-A3 for 23% efficiency improvement.",
        "Your current stock levels suggest ordering 150 units of iPhone 14 Pro within the next 5 days to meet projected demand.",
        "I've detected an unusual spike in returns for SKU FURN-OC-001. This may indicate a quality issue that needs investigation."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'assistant');
      setLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isFullscreen) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isResizing || isFullscreen) return;
    
    const newWidth = Math.max(300, Math.min(600, e.clientX - position.x));
    const newHeight = Math.max(400, Math.min(800, e.clientY - position.y));
    
    setSize({ width: newWidth, height: newHeight });
  };

  // Bind global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, position, size]);

  const resetPosition = () => {
    setPosition({ x: window.innerWidth - 420, y: 100 });
    setSize({ width: 384, height: 500 });
  };

  if (hidden) {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-accent hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed bg-card border border-border shadow-2xl transition-all duration-300 z-50 select-none",
        isFullscreen 
          ? "inset-4 rounded-lg" 
          : "rounded-lg"
      )}
      style={
        isFullscreen 
          ? {} 
          : {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
            }
      }
    >
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-4 border-b border-border",
          !isFullscreen && "cursor-move"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <img src={aiIcon} alt="AI Assistant" className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{t('ai.title')}</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? t('ai.thinking') : t('ai.online')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPosition}
              className="h-8 w-8 p-0"
              title="Reset Position"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChat}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className={cn(
        "p-4",
        isFullscreen ? "h-[calc(100vh-200px)]" : `h-[${size.height - 160}px]`
      )}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ai.placeholder')}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Mic className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resize handle */}
      {!isFullscreen && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <Move className="h-3 w-3 transform rotate-45" />
        </div>
      )}
    </div>
  );
};