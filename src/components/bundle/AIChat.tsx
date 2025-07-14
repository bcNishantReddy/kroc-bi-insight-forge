
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validateChatMessage } from "@/utils/validation";

interface AIChatProps {
  bundle: any;
  csvData: any[];
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  created_at: string;
}

export default function AIChat({ bundle, csvData }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [messageError, setMessageError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchChatHistory();
  }, [bundle.id]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("bundle_id", bundle.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Error fetching chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("bundle_id", bundle.id);

      if (error) throw error;
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Error clearing chat history");
    }
  };

  const prepareSecureDataSample = (data: any[]): any[] => {
    // Limit to first 50 rows for security
    const limitedData = data.slice(0, 50);
    
    // Remove potentially sensitive columns (those that might contain PII)
    const sensitivePatterns = /^(email|phone|ssn|social|address|name|id|password|key|token)$/i;
    
    return limitedData.map(row => {
      const sanitizedRow: any = {};
      Object.keys(row).forEach(key => {
        if (!sensitivePatterns.test(key)) {
          sanitizedRow[key] = row[key];
        } else {
          sanitizedRow[key] = "[REDACTED]";
        }
      });
      return sanitizedRow;
    });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    // Validate message
    const messageValidation = validateChatMessage(currentMessage);
    if (!messageValidation.isValid) {
      setMessageError(messageValidation.error || "Invalid message");
      return;
    }

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setMessageError("");
    setLoading(true);

    try {
      // Prepare secure data sample
      const secureDataSample = prepareSecureDataSample(csvData);
      
      // Call edge function for AI response
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: userMessage,
          csvData: secureDataSample, // Send only sanitized sample
          bundleInfo: {
            name: bundle.name,
            totalRows: csvData.length,
            columns: Object.keys(csvData[0] || {}).map(col => {
              // Redact potentially sensitive column names
              const sensitivePatterns = /^(email|phone|ssn|social|address|name|id|password|key|token)$/i;
              return sensitivePatterns.test(col) ? "[SENSITIVE_COLUMN]" : col;
            })
          }
        }
      });

      if (error) {
        console.error("AI chat error:", error);
        throw new Error("Failed to get AI response. Please try again.");
      }

      const aiResponse = data.response;

      // Save to database with sanitized inputs
      const { data: savedMessage, error: saveError } = await supabase
        .from("chat_messages")
        .insert({
          bundle_id: bundle.id,
          user_id: user?.id,
          message: userMessage,
          response: aiResponse
        })
        .select()
        .single();

      if (saveError) {
        console.error("Save message error:", saveError);
        throw new Error("Failed to save message");
      }

      setMessages(prev => [...prev, savedMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Error sending message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exampleQueries = [
    "What are the key statistics for this dataset?",
    "Can you identify any trends or patterns?",
    "Are there any outliers or anomalies?",
    "What correlations exist between different columns?",
    "Can you summarize the main insights?"
  ];

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-600">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <Shield className="h-4 w-4" />
            <p className="text-sm">
              <strong>Privacy Protected:</strong> Only a sample of your data (50 rows) is sent to AI, 
              with sensitive columns automatically redacted for your security.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-amber-800">AI Data Assistant</CardTitle>
              <CardDescription>
                Ask questions about your data and get intelligent insights
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <ScrollArea className="h-96 border rounded-lg p-4 bg-amber-50/50">
              {messages.length === 0 ? (
                <div className="text-center text-amber-600 py-8">
                  <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Start a conversation about your data!</p>
                  <p className="text-sm mt-2">Try asking about statistics, trends, or patterns.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex items-start space-x-3">
                        <div className="bg-amber-600 rounded-full p-2">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm flex-1">
                          <p className="text-amber-900">{msg.message}</p>
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex items-start space-x-3">
                        <div className="bg-amber-100 rounded-full p-2">
                          <Bot className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 shadow-sm flex-1">
                          <p className="text-amber-900 whitespace-pre-wrap">{msg.response}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-amber-100 rounded-full p-2">
                        <Bot className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 shadow-sm">
                        <p className="text-amber-600">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask a question about your data..."
                  value={currentMessage}
                  onChange={(e) => {
                    setCurrentMessage(e.target.value);
                    setMessageError("");
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className={`flex-1 ${messageError ? "border-red-500" : ""}`}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !currentMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {messageError && (
                <p className="text-red-500 text-xs">{messageError}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Example Questions</CardTitle>
          <CardDescription>
            Click on any example to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-3"
                onClick={() => setCurrentMessage(query)}
                disabled={loading}
              >
                {query}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
