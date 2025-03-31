import { supabase } from '../supabase/client';
import type { TextToSpeechRequest, SpeechToTextRequest, SpeechToTextResponse, Voice } from './types';

export class ElevenLabsClient {
    private static instance: ElevenLabsClient;
    private apiKey: string | null = null;
    private baseUrl = 'https://api.elevenlabs.io/v1';
    private defaultVoiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID

    private constructor() {}

    public static getInstance(): ElevenLabsClient {
        if (!ElevenLabsClient.instance) {
            ElevenLabsClient.instance = new ElevenLabsClient();
        }
        return ElevenLabsClient.instance;
    }

    private async initializeApiKey(): Promise<void> {
        if (this.apiKey) return;

        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('secrets')
            .select('elevenlabs_api_key')
            .single();

        if (error || !data?.elevenlabs_api_key) {
            throw new Error('ElevenLabs API key not found');
        }

        this.apiKey = data.elevenlabs_api_key;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        isAudioResponse = false
    ): Promise<T> {
        await this.initializeApiKey();

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'xi-api-key': this.apiKey!,
                ...(!isAudioResponse && { 'Content-Type': 'application/json' }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${error}`);
        }

        if (isAudioResponse) {
            const blob = await response.blob();
            return blob as unknown as T;
        }

        return response.json();
    }

    async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
        const voiceId = request.voice_id || this.defaultVoiceId;
        const endpoint = `/text-to-speech/${voiceId}`;

        return this.makeRequest<Blob>(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify({
                    text: request.text,
                    model_id: request.model_id || 'eleven_monolingual_v1',
                    voice_settings: request.voice_settings || {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true,
                    },
                }),
            },
            true
        );
    }

    async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
        const formData = new FormData();
        formData.append('audio', request.audio);
        if (request.language) {
            formData.append('language', request.language);
        }

        return this.makeRequest<SpeechToTextResponse>(
            '/speech-to-text',
            {
                method: 'POST',
                body: formData,
            }
        );
    }

    async getVoices(): Promise<Voice[]> {
        return this.makeRequest<Voice[]>('/voices');
    }

    async getDefaultVoiceSettings(): Promise<Voice> {
        return this.makeRequest<Voice>(`/voices/${this.defaultVoiceId}/settings`);
    }
}
