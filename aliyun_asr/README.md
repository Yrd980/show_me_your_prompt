# Aliyun ASR Voice Input Demo

A real-time speech recognition application using Aliyun's WebSocket ASR API. This demo showcases how to integrate voice input into web forms using React and TypeScript.

## Features

- Real-time speech-to-text conversion
- WebSocket-based streaming audio
- Automatic punctuation and text normalization
- Form field integration with voice input
- Visual feedback for recording and transcription status
- Support for intermediate and final results

## Prerequisites

Before running this application, you need:

1. **Aliyun Account**: Sign up at [https://www.aliyun.com](https://www.aliyun.com)
2. **ISI Service**: Enable Intelligent Speech Interaction service
3. **AppKey**: Get your application key from the Aliyun ISI console
4. **Access Token**: Generate a temporary token (valid for 24 hours)

## Getting Your Aliyun Credentials

### Step 1: AppKey
1. Log in to [Aliyun Console](https://www.aliyun.com)
2. Navigate to **Intelligent Speech Interaction (ISI)**
3. Create a new project or select an existing one
4. Copy your **AppKey** from the project settings

### Step 2: Access Token

**IMPORTANT SECURITY NOTE**: Your AccessKeySecret should NEVER be exposed in frontend code. Token generation must be done server-side or locally.

#### Option A: Using the Token Generator Script (Recommended for Development)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   ACCESS_KEY_ID=your_access_key_id
   ACCESS_KEY_SECRET=your_access_key_secret
   ```

3. Run the token generator:
   ```bash
   node scripts/generate-token.js
   ```

4. Copy the generated token (valid for 24 hours)

#### Option B: Using Environment Variables (No .env file)

```bash
ACCESS_KEY_ID=your_id ACCESS_KEY_SECRET=your_secret node scripts/generate-token.js
```

#### Option C: Production Setup

For production, implement a backend API endpoint that:
- Accepts requests from your authenticated frontend users
- Generates tokens using your stored AccessKeySecret
- Returns only the token (never the secret)
- Implements rate limiting and access controls

See the [official documentation](https://help.aliyun.com/zh/isi/getting-started/use-http-or-https-to-obtain-an-access-token) for details.

## Installation

```bash
# Navigate to the project directory
cd aliyun_asr

# Install dependencies
npm install
```

## Running the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Configure Credentials**
   - Enter your Aliyun Access Token
   - Enter your AppKey
   - Click "Start Using Voice Input"

2. **Fill Form with Voice**
   - Click on any form field (Name, Email, or Message)
   - Click "Connect & Record" to start voice recognition
   - Speak clearly into your microphone
   - See real-time transcription appear in the field
   - Click "Stop Recording" when finished

3. **Submit Form**
   - Review the transcribed text
   - Click "Submit Form" to complete

## Project Structure

```
aliyun_asr/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── VoiceInput.tsx   # Voice input component
│   │   └── VoiceInputForm.tsx # Demo form with voice input
│   ├── hooks/
│   │   └── useAliyunASR.ts  # WebSocket ASR hook
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── package.json
└── README.md
```

## Key Components

### `useAliyunASR` Hook
Located in `src/hooks/useAliyunASR.ts`

Custom React hook that manages:
- WebSocket connection to Aliyun ASR service
- Audio recording and streaming
- Real-time transcription results
- Connection state management

**Usage:**
```typescript
const {
  isConnected,
  isRecording,
  transcription,
  intermediateResult,
  error,
  connect,
  disconnect,
  startRecording,
  stopRecording
} = useAliyunASR({
  token: 'your-token',
  appkey: 'your-appkey',
  sampleRate: 16000,
  enableIntermediateResult: true,
  enablePunctuation: true
});
```

### `VoiceInput` Component
Located in `src/components/VoiceInput.tsx`

A reusable component for voice input with visual feedback.

**Props:**
- `token`: Aliyun access token
- `appkey`: Your application key
- `onTranscriptionChange`: Callback for transcription updates
- `sampleRate`: Audio sample rate (8000 or 16000)
- `placeholder`: Placeholder text

### `VoiceInputForm` Component
Located in `src/components/VoiceInputForm.tsx`

Demo form that integrates voice input for filling form fields.

## Technical Details

### Audio Specifications
- **Format**: PCM 16-bit mono
- **Sample Rate**: 16000 Hz (default)
- **Chunk Size**: 1600 samples (3200 bytes)
- **Browser API**: Web Audio API + MediaRecorder

### WebSocket Protocol
- **Connection URL**: `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token={token}`
- **Message Format**: JSON for commands, Binary for audio data
- **Commands**: StartTranscription, StopTranscription
- **Events**: TranscriptionStarted, TranscriptionResultChanged, SentenceEnd, TranscriptionCompleted

### Message Structure

**Request (StartTranscription):**
```json
{
  "header": {
    "appkey": "your-appkey",
    "message_id": "unique-32-char-id",
    "task_id": "unique-32-char-session-id",
    "namespace": "SpeechTranscriber",
    "name": "StartTranscription"
  },
  "payload": {
    "format": "pcm",
    "sample_rate": 16000,
    "enable_intermediate_result": true,
    "enable_punctuation_prediction": true,
    "enable_inverse_text_normalization": true
  }
}
```

**Response (SentenceEnd):**
```json
{
  "header": {
    "namespace": "SpeechTranscriber",
    "name": "SentenceEnd",
    "status": 20000000
  },
  "payload": {
    "result": "transcribed text with punctuation",
    "time": 1234,
    "index": 0
  }
}
```

## Browser Requirements

- Modern browser with Web Audio API support
- Microphone access permission
- WebSocket support
- HTTPS (for production)

## Troubleshooting

### Token Expired
- Aliyun tokens are valid for 24 hours
- Generate a new token if you get authentication errors
- Click "Reconfigure" to enter a new token

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS in production
- Test microphone in browser settings

### Connection Failed
- Verify token and appkey are correct
- Check network connectivity
- Ensure you're using the correct region endpoint

### No Transcription Results
- Speak clearly and at a moderate pace
- Check microphone volume levels
- Ensure your Aliyun account has sufficient quota

## Resources

- [Aliyun ISI Documentation](https://help.aliyun.com/zh/isi/)
- [WebSocket API Reference](https://help.aliyun.com/zh/isi/developer-reference/websocket)
- [Token Service](https://help.aliyun.com/zh/isi/developer-reference/api-authorization)

## License

MIT

## Built With

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Aliyun ISI WebSocket API
