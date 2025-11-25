"use client";

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({
  isListening,
  onClick,
  disabled,
}: MicrophoneButtonProps) {
  return (
    <div className="relative">
      {/* Pulse animation rings */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring opacity-30" />
          <div
            className="absolute inset-[-6px] rounded-full bg-red-400 animate-pulse-ring opacity-20"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-[-12px] rounded-full bg-red-400 animate-pulse-ring opacity-10"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}

      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-105
          ${
            isListening
              ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse-dot"
              : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isListening ? (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
