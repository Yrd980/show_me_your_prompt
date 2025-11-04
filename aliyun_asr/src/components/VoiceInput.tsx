import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useAliyunASR } from '@/hooks/useAliyunASR';

interface VoiceInputProps {
  token: string;
  appkey: string;
  onTranscriptionChange?: (text: string) => void;
  fieldId?: string;
  sampleRate?: 8000 | 16000;
  placeholder?: string;
}

export function VoiceInput({
  token,
  appkey,
  onTranscriptionChange,
  fieldId,
  sampleRate = 16000,
  placeholder = 'Click the microphone to start speaking...'
}: VoiceInputProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    isConnected,
    isRecording,
    transcription,
    intermediateResult,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearTranscription
  } = useAliyunASR({
    token,
    appkey,
    sampleRate,
    enableIntermediateResult: true,
    enablePunctuation: true,
    enableInverseTextNormalization: true
  });

  // Clear transcription when field changes
  const prevFieldIdRef = useRef(fieldId);
  useEffect(() => {
    if (prevFieldIdRef.current !== fieldId) {
      clearTranscription();
      prevFieldIdRef.current = fieldId;
    }
  }, [fieldId, clearTranscription]);

  // Notify parent component of transcription changes
  const fullTextRef = useRef('');
  useEffect(() => {
    if (onTranscriptionChange) {
      const fullText = transcription + intermediateResult;
      // Only call if the text actually changed to prevent infinite loops
      if (fullTextRef.current !== fullText) {
        fullTextRef.current = fullText;
        onTranscriptionChange(fullText);
      }
    }
  }, [transcription, intermediateResult]);

  const handleToggleRecording = async () => {
    if (!isConnected) {
      // Connect first
      setIsConnecting(true);
      try {
        await connect();
        // Wait a bit for the connection to establish
        setTimeout(async () => {
          await startRecording();
          setIsConnecting(false);
        }, 500);
      } catch (err) {
        setIsConnecting(false);
        console.error('Failed to connect:', err);
      }
    } else if (isRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleDisconnect = () => {
    stopRecording();
    disconnect();
  };

  const displayText = transcription + intermediateResult || placeholder;
  const isIntermediate = intermediateResult.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="min-h-[120px] p-4 bg-muted rounded-lg mb-4">
            <p className={`text-sm ${!transcription && !intermediateResult ? 'text-muted-foreground italic' : ''}`}>
              {displayText}
              {isIntermediate && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleRecording}
              disabled={isConnecting}
              variant={isRecording ? 'destructive' : 'default'}
              size="lg"
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : isRecording ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  {isConnected ? 'Start Recording' : 'Connect & Record'}
                </>
              )}
            </Button>

            {isConnected && !isRecording && (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="lg"
              >
                Disconnect
              </Button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            {isRecording && (
              <>
                <span className="mx-2">•</span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Recording</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Click "Connect & Record" to start voice recognition</p>
        <p>• Speak clearly into your microphone</p>
        <p>• Transcription will appear in real-time</p>
        <p>• Click "Stop Recording" when finished</p>
      </div>
    </div>
  );
}
