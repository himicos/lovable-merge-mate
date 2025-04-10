import { supabase } from '../../supabase/client.js';
import type { TextToSpeechRequest, SpeechToTextRequest, SpeechToTextResponse, Voice } from './types.js';

export class ElevenLabsClient {
    private static instance: ElevenLabsClient;
    private apiKey: string | null = null;
    private baseUrl = 'https://api.elevenlabs.io/v1';
    public readonly defaultVoiceId = '21m00Tcm4TlvDq8ikWAM';

    private constructor() {}

    public static getInstance(): ElevenLabsClient {
        if (!ElevenLabsClient.instance) {
            ElevenLabsClient.instance = new ElevenLabsClient();
        }
        return ElevenLabsClient.instance;
    }

    public async initializeApiKey(): Promise<void> {
        const { data: secrets } = await supabase.from('secrets').select('elevenlabs_api_key').single();
        this.apiKey = secrets?.elevenlabs_api_key || null;
        
        if (!this.apiKey) {
            throw new Error('ElevenLabs API key not found');
        }
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        isAudioResponse = false
    ): Promise<T> {
        if (!this.apiKey) {
            await this.initializeApiKey();
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'xi-api-key': this.apiKey!,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${error}`);
        }

        if (isAudioResponse) {
            const blob = await response.blob();
            return blob as T;
        }

        const data = await response.json();
        return data as T;
    }

    public async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
        const voiceId = request.voice_id || this.defaultVoiceId;
        const endpoint = `/text-to-speech/${voiceId}`;

        return this.makeRequest<Blob>(
            endpoint,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: request.text,
                    voice_settings: request.voice_settings,
                }),
            },
            true
        );
    }

    public async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
        const endpoint = '/speech-to-text';
        const formData = new FormData();
        formData.append('audio', request.audio);

        return this.makeRequest<SpeechToTextResponse>(endpoint, {
            method: 'POST',
            body: formData,
        });
    }

    public async getVoices(): Promise<Voice[]> {
        return this.makeRequest<Voice[]>('/voices');
    }

    public async getDefaultVoiceSettings(): Promise<Voice> {
        return this.makeRequest<Voice>(`/voices/${this.defaultVoiceId}`);
    }
}
