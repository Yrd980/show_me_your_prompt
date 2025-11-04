import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSharedASR } from '@/hooks/useSharedASR';

interface VoiceEnabledInputProps {
  token: string;
  appkey: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'textarea';
  voiceEnabled?: boolean;
  className?: string;
  rows?: number;
}

export function VoiceEnabledInput({
  token,
  appkey,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  voiceEnabled = true,
  className = '',
  rows = 4
}: VoiceEnabledInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const lastTranscriptionRef = useRef('');

  const {
    isConnected,
    isRecording,
    activeFieldId,
    transcription,
    intermediateResult,
    error,
    startRecording,
    stopRecording,
    clearTranscription
  } = useSharedASR({
    token,
    appkey,
    sampleRate: 16000
  });

  const isActiveField = activeFieldId === name;
  const fullText = transcription + intermediateResult;

  // Update input value when transcription changes
  useEffect(() => {
    if (isActiveField && fullText !== lastTranscriptionRef.current) {
      onChange(fullText);
      lastTranscriptionRef.current = fullText;
    }
  }, [fullText, isActiveField, onChange]);

  const handleFocus = async () => {
    setIsFocused(true);

    if (!voiceEnabled) return;

    try {
      setIsConnecting(true);
      clearTranscription();
      lastTranscriptionRef.current = '';
      await startRecording(name);
    } catch (err) {
      console.error('Failed to start recording:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (!voiceEnabled) return;

    if (isActiveField && isRecording) {
      stopRecording();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const baseClassName = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${className}`;
  const voiceActiveClassName = isActiveField && isRecording ? 'ring-2 ring-red-500 border-red-500' : '';
  const finalClassName = `${baseClassName} ${voiceActiveClassName}`;

  const InputElement = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <div className="relative">
        <InputElement
          ref={inputRef as any}
          type={type === 'textarea' ? undefined : type}
          rows={type === 'textarea' ? rows : undefined}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={finalClassName}
        />

        {/* Voice Status Indicator */}
        {voiceEnabled && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {isConnecting && (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            )}

            {isActiveField && isRecording && !isConnecting && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <Mic className="h-4 w-4 text-red-500" />
              </div>
            )}

            {!isActiveField && voiceEnabled && isConnected && (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}

            {!isActiveField && voiceEnabled && !isConnected && (
              <Mic className="h-4 w-4 text-muted-foreground opacity-50" />
            )}
          </div>
        )}
      </div>

      {/* Real-time Transcription Preview */}
      {isActiveField && (intermediateResult || isRecording) && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>
            {intermediateResult ? (
              <span className="italic">"{intermediateResult}"</span>
            ) : (
              <span>Listening...</span>
            )}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && isActiveField && (
        <div className="text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Voice Enabled Hint (only show when not focused) */}
      {voiceEnabled && !isFocused && !isConnected && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Mic className="h-3 w-3" />
          <span>Click to speak</span>
        </div>
      )}
    </div>
  );
}
