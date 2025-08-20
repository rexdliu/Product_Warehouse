import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  Mic,
  Paperclip
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useAIStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import aiIcon from '@/assets/chatBot.svg';

interface SpeechRecognitionResult {
  0: { transcript: string };
  length: number;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionInstance {
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionGlobal {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}
interface AIAssistantProps {
  hidden ?: boolean;
}

export const AIAssistant:React.FC<AIAssistantProps> = ({ hidden = false }) => {
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
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [dimensions, setDimensions] = useState({ width: 384, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setPosition({
      x: window.innerWidth - dimensions.width - 24,
      y: window.innerHeight - dimensions.height - 24
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addMessage(`Uploaded file: ${file.name}`, 'user');
      e.target.value = '';
    }
  };

  const handleMicClick = () => {
    const { SpeechRecognition, webkitSpeechRecognition } =
      window as unknown as SpeechRecognitionGlobal;
    const SpeechRecognitionCtor = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'en-US';
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  if(hidden){
    return null;
  }
//isOpen是false，则仅呈现浮动按钮
  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-accent hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }
  return (
    <Rnd
      size={
        isFullscreen
          ? {
              width: windowSize.width - 32,
              height: windowSize.height - 32,
            }
          : dimensions
      }
      position={isFullscreen ? { x: 16, y: 16 } : position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setDimensions({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(pos);
      }}
      bounds="window"
      minWidth={320}
      minHeight={400}
      enableResizing={!isFullscreen}
      disableDragging={isFullscreen}
      dragHandleClassName="drag-handle"
      style={{ position: 'fixed' }}
      className="bg-card border border-border shadow-2xl transition-all duration-300 z-50 flex flex-col rounded-lg"
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-4 border-b border-border cursor-move">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <img src={aiIcon} alt="AI Assistant" className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Warehouse Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Thinking...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
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
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
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
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={handleUploadClick}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, predictions, or insights..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={handleMicClick}
            aria-label="Toggle microphone"
          >
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
    </Rnd>
  );
};