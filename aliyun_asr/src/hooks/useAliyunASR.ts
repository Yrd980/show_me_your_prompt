import { useRef, useCallback, useState } from 'react';

interface AliyunASRConfig {
  token: string;
  appkey: string;
  sampleRate?: 8000 | 16000;
  format?: 'pcm' | 'wav' | 'opus';
  enableIntermediateResult?: boolean;
  enablePunctuation?: boolean;
  enableInverseTextNormalization?: boolean;
}

interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  sentenceId?: number;
  time?: number;
}

interface AliyunASRHook {
  isConnected: boolean;
  isRecording: boolean;
  transcription: string;
  intermediateResult: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendAudioData: (audioData: ArrayBuffer) => void;
  clearTranscription: () => void;
}

export function useAliyunASR(config: AliyunASRConfig): AliyunASRHook {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [intermediateResult, setIntermediateResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const taskIdRef = useRef<string>('');
  const audioChunksRef = useRef<Blob[]>([]);

  const generateId = useCallback(() => {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const wsUrl = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token=${config.token}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      taskIdRef.current = generateId();

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Send StartTranscription command
        const startMessage = {
          header: {
            appkey: config.appkey,
            message_id: generateId(),
            task_id: taskIdRef.current,
            namespace: 'SpeechTranscriber',
            name: 'StartTranscription'
          },
          payload: {
            format: config.format || 'pcm',
            sample_rate: config.sampleRate || 16000,
            enable_intermediate_result: config.enableIntermediateResult ?? true,
            enable_punctuation_prediction: config.enablePunctuation ?? true,
            enable_inverse_text_normalization: config.enableInverseTextNormalization ?? true
          }
        };

        ws.send(JSON.stringify(startMessage));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          const { header, payload } = response;

          console.log('Received message:', header.name, payload);

          switch (header.name) {
            case 'TranscriptionStarted':
              console.log('Transcription started');
              break;

            case 'TranscriptionResultChanged':
              // Intermediate result
              if (payload && payload.result) {
                setIntermediateResult(payload.result);
              }
              break;

            case 'SentenceEnd':
              // Final result for a sentence
              if (payload && payload.result) {
                setTranscription(prev => prev + payload.result + ' ');
                setIntermediateResult('');
              }
              break;

            case 'TranscriptionCompleted':
              console.log('Transcription completed');
              break;

            case 'TaskFailed':
              const errorMessage = payload?.message || payload?.error_message ||
                                  (header.status_text) || 'Unknown error';
              const statusCode = header.status || 'N/A';
              setError(`Task failed (${statusCode}): ${errorMessage}`);
              console.error('TaskFailed details:', { header, payload });
              break;

            default:
              console.log('Unhandled message type:', header.name);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    }
  }, [config, generateId]);

  const disconnect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send StopTranscription command
      const stopMessage = {
        header: {
          appkey: config.appkey,
          message_id: generateId(),
          task_id: taskIdRef.current,
          namespace: 'SpeechTranscriber',
          name: 'StopTranscription'
        },
        payload: {}
      };

      wsRef.current.send(JSON.stringify(stopMessage));
      wsRef.current.close();
    }

    wsRef.current = null;
    setIsConnected(false);
  }, [config.appkey, generateId]);

  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send audio data as binary
      wsRef.current.send(audioData);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      isRecordingRef.current = true;
      setIsRecording(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: config.sampleRate || 16000,
        }
      });

      streamRef.current = stream;

      // Create AudioContext for processing
      audioContextRef.current = new AudioContext({
        sampleRate: config.sampleRate || 16000
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send audio data in chunks (max 3200 bytes as per docs)
        const chunkSize = 1600; // 1600 samples = 3200 bytes
        for (let i = 0; i < pcmData.length; i += chunkSize) {
          const chunk = pcmData.slice(i, Math.min(i + chunkSize, pcmData.length));
          sendAudioData(chunk.buffer);
        }
      };

    } catch (err) {
      isRecordingRef.current = false;
      setIsRecording(false);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      console.error('Error starting recording:', err);
    }
  }, [config.sampleRate, sendAudioData]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect and cleanup processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription('');
    setIntermediateResult('');
  }, []);

  return {
    isConnected,
    isRecording,
    transcription,
    intermediateResult,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendAudioData,
    clearTranscription
  };
}
