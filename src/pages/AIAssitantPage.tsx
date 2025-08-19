import React, { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Package, BarChart3, Bot, Send, Mic, Paperclip } from 'lucide-react';
import aiIcon from '@/assets/chatBot.svg';

const AIAssistantPage: React.FC = () => {
  const { 
    isLoading, 
    messages, 
    suggestions, 
    addMessage, 
    setLoading 
  } = useAIStore();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage(input, 'user');
    const currentInput = input;
    setInput('');
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
                placeholder="Ask about inventory levels, predict sales, or request a report..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="pr-24 h-12 text-base"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;