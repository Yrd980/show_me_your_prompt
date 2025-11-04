import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceInputForm } from '@/components/VoiceInputForm'

function App() {
  const [token, setToken] = useState('')
  const [appkey, setAppkey] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)

  const handleConfigure = () => {
    if (token && appkey) {
      setIsConfigured(true)
    }
  }

  const handleReconfigure = () => {
    setIsConfigured(false)
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Aliyun ASR Voice Input Demo</CardTitle>
            <CardDescription>
              Configure your Aliyun credentials to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Access Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your Aliyun access token"
              />
              <p className="text-xs text-muted-foreground">
                Get your temporary token from Aliyun Console
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="appkey" className="text-sm font-medium">
                AppKey
              </label>
              <input
                id="appkey"
                type="text"
                value={appkey}
                onChange={(e) => setAppkey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your AppKey"
              />
              <p className="text-xs text-muted-foreground">
                Find your AppKey in the Aliyun ISI project settings
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Getting Started:
              </p>
              <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Log in to <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer" className="underline">Aliyun Console</a></li>
                <li>Navigate to Intelligent Speech Interaction (ISI)</li>
                <li>Create or select your project</li>
                <li>Copy your AppKey from project settings</li>
                <li>Generate a temporary token (valid for 24 hours)</li>
              </ol>
            </div>

            <Button
              onClick={handleConfigure}
              className="w-full"
              disabled={!token || !appkey}
            >
              Start Using Voice Input
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Aliyun ASR Voice Input</h1>
            <p className="text-muted-foreground">
              Real-time speech recognition powered by Aliyun WebSocket API
            </p>
          </div>
          <Button variant="outline" onClick={handleReconfigure}>
            Reconfigure
          </Button>
        </div>

        <div className="flex justify-center">
          <VoiceInputForm token={token} appkey={appkey} />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See your speech converted to text in real-time with intermediate results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Punctuation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatic punctuation and text normalization for better readability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seamlessly fill form fields with your voice instead of typing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
