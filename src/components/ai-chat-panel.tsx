"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onInsertText: (text: string) => void;
  documentTitle: string;
}

export function AiChatPanel({
  isOpen,
  onClose,
  currentContent,
  onInsertText,
  documentTitle,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI resume assistant. I can help you:\n\n• Write compelling job descriptions\n• Improve your summary and skills\n• Generate achievement bullets\n• Refine language and tone\n• Structure your resume effectively\n\nWhat would you like help with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Close panel when clicking outside
  useClickOutside(panelRef, handleClose, isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/services/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentResume: currentContent,
          documentTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body reader available");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the assistant message with accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent, isStreaming: true }
              : msg,
          ),
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg,
        ),
      );

      // If no content was streamed, show error
      if (accumulatedContent.trim().length === 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    "I apologize, but I couldn't generate a response. Please try again.",
                  isStreaming: false,
                }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "Sorry, I encountered an error. Please try again or check your connection.",
                isStreaming: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      improve:
        "Please review my resume and suggest improvements for clarity and impact.",
      summary: "Help me write a compelling professional summary.",
      experience:
        "Help me write better descriptions for my work experience using the STAR method.",
      achievements:
        "Help me turn my job responsibilities into achievement-oriented bullet points with metrics.",
      skills: "Suggest relevant skills I should add based on my experience.",
      format: "Review the format and structure of my resume. Any suggestions?",
    };

    setInput(prompts[action] || "");
    setTimeout(() => handleSendMessage(), 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed right-0 top-0 h-screen w-full md:w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col duration-300 ${
        isClosing
          ? "animate-out slide-out-to-right"
          : "animate-in slide-in-from-right"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-linear-to-r from-primary/10 to-purple-500/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-purple-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Resume Assistant</h2>
            <p className="text-xs text-muted-foreground">
              Powered by AI • Always improving
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b bg-muted/30 shrink-0">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("improve")}
            className="text-xs h-7"
          >
            ✨ Improve Resume
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("summary")}
            className="text-xs h-7"
          >
            📝 Write Summary
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("experience")}
            className="text-xs h-7"
          >
            💼 Enhance Experience
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("achievements")}
            className="text-xs h-7"
          >
            🎯 Add Metrics
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onInsertText={onInsertText}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4 shrink-0">
        <div className="flex gap-2 items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about your resume..."
            className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto custom-scrollbar"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
}: {
  message: Message;
  onInsertText: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-[85%] ml-auto">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-purple-500 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="bg-muted rounded-2xl px-4 py-3">
          {message.content.length === 0 && message.isStreaming ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-[2px] h-4 bg-primary ml-1 animate-pulse" />
              )}
            </p>
          )}
        </div>
        {message.id !== "welcome" && !message.isStreaming && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
