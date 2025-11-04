import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceEnabledInput } from './VoiceEnabledInput';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface VoiceInputFormProps {
  token: string;
  appkey: string;
}

export function VoiceInputForm({ token, appkey }: VoiceInputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Form submitted:', formData);

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  if (!token || !appkey) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-destructive">Configuration Required</CardTitle>
          <CardDescription>
            Please provide your Aliyun credentials to use voice input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            <p className="font-medium">Required credentials:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Token:</strong> Temporary access token from Aliyun</li>
              <li><strong>AppKey:</strong> Your application key from Aliyun console</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              To get your credentials:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Log in to Aliyun Console</li>
              <li>Navigate to Intelligent Speech Interaction service</li>
              <li>Create or select your project</li>
              <li>Get your AppKey from project settings</li>
              <li>Generate a temporary token via API or SDK</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Smart Voice-Enabled Contact Form</CardTitle>
          <CardDescription>
            Click on a field to automatically start voice recording. Just speak - no buttons needed!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="text-6xl">✓</div>
              <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400">
                Form Submitted Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your message has been received.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Name
                  <span className="text-xs text-muted-foreground">(Voice enabled)</span>
                </label>
                <VoiceEnabledInput
                  token={token}
                  appkey={appkey}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  placeholder="Your name"
                  voiceEnabled={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Email
                  <span className="text-xs text-muted-foreground">(Type only)</span>
                </label>
                <VoiceEnabledInput
                  token={token}
                  appkey={appkey}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder="your.email@example.com"
                  voiceEnabled={false}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Message
                  <span className="text-xs text-muted-foreground">(Voice enabled)</span>
                </label>
                <VoiceEnabledInput
                  token={token}
                  appkey={appkey}
                  name="message"
                  type="textarea"
                  value={formData.message}
                  onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
                  placeholder="Your message"
                  voiceEnabled={true}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Submit Form
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
