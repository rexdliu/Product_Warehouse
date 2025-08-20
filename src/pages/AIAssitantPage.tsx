import React, { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Send, Mic, Paperclip, Upload, VolumeX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const AIAssistantPage: React.FC = () => {
  const { 
    isLoading, 
    messages, 
    suggestions, 
    addMessage, 
    setLoading 
  } = useAIStore();
  
  const [input, setInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !uploadedFile) return;

    let messageContent = input;
    if (uploadedFile) {
      messageContent += ` [Uploaded: ${uploadedFile.name}]`;
    }

    addMessage(messageContent, 'user');
    const currentInput = input;
    setInput('');
    setUploadedFile(null);
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        'low stock': "Based on your current inventory data, I've identified 3 items with critical low stock levels that need immediate attention: iPhone 14 Pro, Office Chair, and Samsung Galaxy S23.",
        'demand': "I've analyzed your sales data. The demand for 'Electronics' is projected to increase by 25% over the next quarter, especially for new smartphone models.",
        'optimize': "To improve picking efficiency by 15%, I recommend relocating high-frequency items like 'APPL-IP14P-256' to Zone A, Rack 1-3.",
        'default': "I'm processing your request. Based on current data, I can generate inventory reports, predict stock needs, or analyze sales trends. What would you like to focus on?"
      };
      
      const responseKey = Object.keys(responses).find(key => currentInput.toLowerCase().includes(key)) || 'default';
      addMessage(responses[responseKey], 'assistant');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]"> {/* Full height minus header */}
      {/* Left Panel: Insights & Suggestions */}
      <div className="hidden lg:flex flex-col w-80 border-r border-border p-4 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">AI Command Center</h2>
        {uploadedFile && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              File ready: {uploadedFile.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFile(null)}
                className="ml-2 h-6 w-6 p-0"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              <span>Proactive Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div>High return rate detected for <Badge variant="secondary">FURN-OC-001</Badge>. Recommend quality check.</div>
            <div>Consider ordering <Badge variant="secondary">150 units</Badge> of iPhone 14 Pro to meet demand.</div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            {suggestions.map((suggestion, index) => (
              <Button key={index} variant="outline" size="sm" className="justify-start" onClick={() => setInput(suggestion)}>
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex flex-1 flex-col h-full">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={aiIcon} alt="AI Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-lg rounded-lg px-4 py-3 text-sm shadow-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={aiIcon} alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3 text-sm shadow-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Thinking</span>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory, predictions, or insights..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="pr-32 h-12 text-base"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleUploadClick}
                  title="Upload file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant={isRecording ? 'default' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleMicClick}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && !uploadedFile) || isLoading}
                  size="icon"
                  className="h-9 w-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              WarehouseAI can make mistakes. Consider checking important information.
            </p>
            <div className="text-xs text-muted-foreground mt-2 text-center space-y-1">
              <p><strong>Upload functionality:</strong> Click the paperclip icon to upload PDF, Excel, Word, or CSV files for analysis.</p>
              <p><strong>Voice input:</strong> Click the microphone icon to use voice commands (recording state shown by button color).</p>
              <p><strong>Button variants:</strong> Ghost buttons are subtle/transparent, default buttons are filled with primary color.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;