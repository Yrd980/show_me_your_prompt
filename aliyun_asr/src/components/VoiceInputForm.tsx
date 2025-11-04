import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceInput } from './VoiceInput';

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
  const [activeField, setActiveField] = useState<keyof FormData | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleTranscriptionChange = (text: string) => {
    if (activeField) {
      // Get the current field value when switching fields
      const currentValue = formData[activeField];
      // If the field already has content and we're adding more, append
      // Otherwise just use the new transcription
      setFormData(prev => ({
        ...prev,
        [activeField]: text
      }));
    }
  };

  const handleFieldFocus = (field: keyof FormData) => {
    setActiveField(field);
  };

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
    setActiveField(null);
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
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice-Enabled Contact Form</CardTitle>
          <CardDescription>
            Fill out the form using your voice or type manually
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
                <label className="text-sm font-medium">
                  Name {activeField === 'name' && <span className="text-primary">(Recording to this field)</span>}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onFocus={() => handleFieldFocus('name')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email {activeField === 'email' && <span className="text-primary">(Recording to this field)</span>}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => handleFieldFocus('email')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Message {activeField === 'message' && <span className="text-primary">(Recording to this field)</span>}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  onFocus={() => handleFieldFocus('message')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your message"
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

      {!submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Input</CardTitle>
            <CardDescription>
              {activeField
                ? `Recording will fill the "${activeField}" field. Click on a different field to change.`
                : 'Click on a form field above, then use voice input to fill it'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceInput
              token={token}
              appkey={appkey}
              fieldId={activeField || undefined}
              onTranscriptionChange={handleTranscriptionChange}
              placeholder={
                activeField
                  ? `Speak to fill "${activeField}" field...`
                  : 'Please select a field above first'
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
