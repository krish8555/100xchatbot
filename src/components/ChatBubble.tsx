"use client";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 shadow-md
          ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md"
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">{message}</p>
        <p
          className={`
            text-xs mt-1 opacity-70
            ${isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}
          `}
        >
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
