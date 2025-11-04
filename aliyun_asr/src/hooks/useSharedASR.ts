/**
 * Shared ASR Hook
 *
 * Singleton hook for managing a single WebSocket connection
 * shared across all voice-enabled fields
 */

import { useCallback, useRef, useState, useEffect } from 'react';

interface AliyunASRConfig {
  token: string;
  appkey: string;
  sampleRate?: 8000 | 16000;
}

interface SharedASRState {
  isConnected: boolean;
  isRecording: boolean;
  activeFieldId: string | null;
  transcription: string;
  intermediateResult: string;
  error: string | null;
}

interface SharedASRActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: (fieldId: string) => Promise<void>;
  stopRecording: () => void;
  clearTranscription: () => void;
}

// Global singleton state
let globalWsRef: WebSocket | null = null;
let globalAudioContextRef: AudioContext | null = null;
let globalProcessorRef: ScriptProcessorNode | null = null;
let globalStreamRef: MediaStream | null = null;
let globalIsRecordingRef = false;
let globalTaskId = '';
let globalConfig: AliyunASRConfig | null = null;

// Subscribers for state updates
const subscribers = new Set<(state: SharedASRState) => void>();

// Global state
let globalState: SharedASRState = {
  isConnected: false,
  isRecording: false,
  activeFieldId: null,
  transcription: '',
  intermediateResult: '',
  error: null
};

function notifySubscribers() {
  subscribers.forEach(callback => callback({ ...globalState }));
}

function updateState(partial: Partial<SharedASRState>) {
  globalState = { ...globalState, ...partial };
  notifySubscribers();
}

function generateId(): string {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

async function connectToAliyun(config: AliyunASRConfig): Promise<void> {
  if (globalWsRef?.readyState === WebSocket.OPEN) {
    console.log('[SharedASR] Already connected');
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const wsUrl = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token=${config.token}`;
      const ws = new WebSocket(wsUrl);
      globalWsRef = ws;
      globalTaskId = generateId();
      globalConfig = config;

      ws.onopen = () => {
        console.log('[SharedASR] WebSocket connected');
        updateState({ isConnected: true, error: null });

        // Send StartTranscription command
        const startMessage = {
          header: {
            appkey: config.appkey,
            message_id: generateId(),
            task_id: globalTaskId,
            namespace: 'SpeechTranscriber',
            name: 'StartTranscription'
          },
          payload: {
            format: 'pcm',
            sample_rate: config.sampleRate || 16000,
            enable_intermediate_result: true,
            enable_punctuation_prediction: true,
            enable_inverse_text_normalization: true
          }
        };

        ws.send(JSON.stringify(startMessage));
        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          const { header, payload } = response;

          console.log('[SharedASR] Received:', header.name);

          switch (header.name) {
            case 'TranscriptionStarted':
              console.log('[SharedASR] Transcription started');
              break;

            case 'TranscriptionResultChanged':
              if (payload && payload.result) {
                updateState({ intermediateResult: payload.result });
              }
              break;

            case 'SentenceEnd':
              if (payload && payload.result) {
                updateState({
                  transcription: globalState.transcription + payload.result + ' ',
                  intermediateResult: ''
                });
              }
              break;

            case 'TranscriptionCompleted':
              console.log('[SharedASR] Transcription completed');
              break;

            case 'TaskFailed':
              const errorMessage = payload?.message || payload?.error_message ||
                                  header.status_text || 'Unknown error';
              const statusCode = header.status || 'N/A';
              updateState({ error: `Task failed (${statusCode}): ${errorMessage}` });
              console.error('[SharedASR] TaskFailed:', { header, payload });
              break;
          }
        } catch (err) {
          console.error('[SharedASR] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[SharedASR] WebSocket error:', event);
        updateState({ error: 'WebSocket connection error', isConnected: false });
        reject(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('[SharedASR] WebSocket closed');
        updateState({ isConnected: false, isRecording: false });
        globalWsRef = null;
      };

    } catch (err) {
      updateState({ error: err instanceof Error ? err.message : 'Connection failed' });
      reject(err);
    }
  });
}

function disconnectFromAliyun() {
  if (globalWsRef && globalWsRef.readyState === WebSocket.OPEN) {
    const stopMessage = {
      header: {
        appkey: globalConfig?.appkey,
        message_id: generateId(),
        task_id: globalTaskId,
        namespace: 'SpeechTranscriber',
        name: 'StopTranscription'
      },
      payload: {}
    };

    globalWsRef.send(JSON.stringify(stopMessage));
    globalWsRef.close();
  }

  globalWsRef = null;
  updateState({ isConnected: false, isRecording: false, activeFieldId: null });
}

async function startRecordingForField(fieldId: string) {
  try {
    globalIsRecordingRef = true;
    updateState({ isRecording: true, activeFieldId: fieldId, error: null });

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: globalConfig?.sampleRate || 16000,
      }
    });

    globalStreamRef = stream;

    // Create AudioContext for processing
    globalAudioContextRef = new AudioContext({
      sampleRate: globalConfig?.sampleRate || 16000
    });

    const source = globalAudioContextRef.createMediaStreamSource(stream);
    const processor = globalAudioContextRef.createScriptProcessor(4096, 1, 1);
    globalProcessorRef = processor;

    source.connect(processor);
    processor.connect(globalAudioContextRef.destination);

    processor.onaudioprocess = (e) => {
      if (!globalIsRecordingRef) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Send audio data in chunks
      const chunkSize = 1600;
      for (let i = 0; i < pcmData.length; i += chunkSize) {
        const chunk = pcmData.slice(i, Math.min(i + chunkSize, pcmData.length));
        if (globalWsRef && globalWsRef.readyState === WebSocket.OPEN) {
          globalWsRef.send(chunk.buffer);
        }
      }
    };

  } catch (err) {
    globalIsRecordingRef = false;
    updateState({
      isRecording: false,
      error: err instanceof Error ? err.message : 'Failed to start recording'
    });
    console.error('[SharedASR] Error starting recording:', err);
  }
}

function stopRecordingSession() {
  globalIsRecordingRef = false;
  updateState({ isRecording: false, activeFieldId: null });

  // Stop audio tracks
  if (globalStreamRef) {
    globalStreamRef.getTracks().forEach(track => track.stop());
    globalStreamRef = null;
  }

  // Disconnect processor
  if (globalProcessorRef) {
    globalProcessorRef.disconnect();
    globalProcessorRef = null;
  }

  // Close audio context
  if (globalAudioContextRef) {
    globalAudioContextRef.close();
    globalAudioContextRef = null;
  }
}

function clearTranscriptionState() {
  updateState({ transcription: '', intermediateResult: '' });
}

export function useSharedASR(config: AliyunASRConfig): SharedASRState & SharedASRActions {
  const [state, setState] = useState<SharedASRState>(globalState);

  useEffect(() => {
    // Subscribe to global state updates
    subscribers.add(setState);
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  const connect = useCallback(async () => {
    await connectToAliyun(config);
  }, [config]);

  const disconnect = useCallback(() => {
    stopRecordingSession();
    disconnectFromAliyun();
  }, []);

  const startRecording = useCallback(async (fieldId: string) => {
    // If already recording for a different field, stop first
    if (globalIsRecordingRef && globalState.activeFieldId !== fieldId) {
      stopRecordingSession();
      clearTranscriptionState();
    }

    // Auto-connect if not connected
    if (!globalWsRef || globalWsRef.readyState !== WebSocket.OPEN) {
      await connectToAliyun(config);
      // Wait a bit for connection to establish
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await startRecordingForField(fieldId);
  }, [config]);

  const stopRecording = useCallback(() => {
    stopRecordingSession();
  }, []);

  const clearTranscription = useCallback(() => {
    clearTranscriptionState();
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearTranscription
  };
}
