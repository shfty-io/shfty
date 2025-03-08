"use client";

import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { XCircle, CheckCircle, AlertCircle, InfoIcon } from "lucide-react";

interface MessageDisplayProps {
  message: string;
}

type MessageType = "success" | "error" | "warning" | "info";

export function MessageDisplay({ message }: MessageDisplayProps) {
  const [visible, setVisible] = useState(true);
  const [messageType, setMessageType] = useState<MessageType>("info");
  const [title, setTitle] = useState("Information");
  
  useEffect(() => {
    // Auto-hide after 7 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);
    
    // Determine message type from content
    if (message.toLowerCase().includes("success") || message.toLowerCase().includes("deleted")) {
      setMessageType("success");
      setTitle("Success");
    } else if (message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")) {
      setMessageType("error");
      setTitle("Error");
    } else if (message.toLowerCase().includes("warning")) {
      setMessageType("warning");
      setTitle("Warning");
    }
    
    return () => clearTimeout(timer);
  }, [message]);
  
  if (!visible) return null;
  
  const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <InfoIcon className="h-4 w-4" />
  };
  
  // Decode URL encoded message
  const decodedMessage = decodeURIComponent(message.replace(/\+/g, ' '));
  
  // Map our message types to the Alert component's expected variant types
  const getAlertVariant = (type: MessageType): "default" | "destructive" => {
    switch(type) {
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };
  
  return (
    <Alert 
      variant={getAlertVariant(messageType)}
      className="mb-4 animate-in fade-in-50 slide-in-from-top-5 duration-300"
    >
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">{icons[messageType]}</div>
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{decodedMessage}</AlertDescription>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="ml-auto -mt-1 -mr-1 p-1 text-muted-foreground hover:text-foreground"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
} 