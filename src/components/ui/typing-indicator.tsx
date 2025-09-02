import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-sm text-muted-foreground ml-2 animate-pulse">
        AI is thinking...
      </span>
    </div>
  );
}

interface AgentLoadingProps {
  className?: string;
  message?: string;
}

export function AgentLoading({ className, message = "Processing your request" }: AgentLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-3 animate-fade-in", className)}>
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">{message}</span>
          <TypingIndicator />
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full animate-pulse" style={{
            animation: 'pulse 2s ease-in-out infinite, slide 3s ease-in-out infinite'
          }} />
        </div>
      </div>
    </div>
  );
}