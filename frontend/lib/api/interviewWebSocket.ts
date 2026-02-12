// frontend/lib/api/interviewWebSocket.ts

interface WebSocketConfig {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onAIResponse: (response: string) => void;
  onAIAudio: (audioBase64: string) => void;
  onError: (error: string) => void;
  onStateChange: (state: 'connecting' | 'connected' | 'disconnected') => void;
}

export class InterviewWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private apiKeys: {
    assemblyai: string;
    groq: string;
    murf: string;
    serpapi: string;
  };

  constructor(config: WebSocketConfig, apiKeys: any) {
    this.config = config;
    this.apiKeys = apiKeys;
  }

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    this.ws = new WebSocket(`${wsUrl}/ws/interview`);

    this.config.onStateChange('connecting');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.config.onStateChange('connected');
      
      // Send API keys configuration
      this.send({
        type: 'config',
        keys: this.apiKeys
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'transcript_partial':
            this.config.onTranscript(data.text, false);
            break;
          case 'transcript_final':
            this.config.onTranscript(data.text, true);
            break;
          case 'ai_response':
            this.config.onAIResponse(data.text);
            break;
          case 'ai_audio':
            this.config.onAIAudio(data.audio);
            break;
          case 'error':
            this.config.onError(data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.config.onError('Connection error occurred');
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.config.onStateChange('disconnected');
    };
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendAudio(audioData: ArrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}