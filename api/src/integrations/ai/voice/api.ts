import axios from 'axios';

interface VoiceResponse {
    audioUrl: string;
    duration: number;
}

interface VoiceRequest {
    text: string;
    messageId: string;
}

interface ResponseData {
    messageId: string;
    audioUrl: string;
    duration: number;
}

interface SecretsResponse {
    elevenlabs_api_key: string;
}

export class VoiceAPI {
    private apiKey: string | null = null;
    private userId: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';

    private constructor(userId: string) {
        this.userId = userId;
    }

    public static async create(userId: string): Promise<VoiceAPI> {
        const api = new VoiceAPI(userId);
        await api.initialize();
        return api;
    }

    private async initialize(): Promise<void> {
        const secrets = await this.getSecrets(this.userId);
        this.apiKey = secrets.elevenlabs_api_key;

        if (!this.apiKey) {
            throw new Error('ElevenLabs API key not found');
        }
    }

    private async getSecrets(userId: string): Promise<SecretsResponse> {
        const { data, error } = await supabase.rpc('get_secrets', { user_id: userId });
        if (error) throw error;
        if (!data) throw new Error('No secrets found');
        return data as SecretsResponse;
    }

    public async generateResponse(request: VoiceRequest): Promise<VoiceResponse> {
        if (!this.apiKey) throw new Error('API not initialized');
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/text-to-speech`,
                {
                    text: request.text,
                    voice_settings: {
                        stability: 0.75,
                        similarity_boost: 0.75
                    }
                },
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );

            const audioBuffer = Buffer.from(response.data);
            const { audioUrl, duration } = await this.uploadToStorage(audioBuffer, request.messageId);

            return { audioUrl, duration };
        } catch (error) {
            console.error('Error generating voice response:', error);
            throw error;
        }
    }

    public async saveResponse(data: ResponseData): Promise<void> {
        const { error } = await supabase
            .from('message_responses')
            .insert({
                user_id: this.userId,
                message_id: data.messageId,
                audio_url: data.audioUrl,
                duration: data.duration,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    }

    private async uploadToStorage(audioBuffer: Buffer, messageId: string): Promise<{ audioUrl: string; duration: number }> {
        const filename = `${this.userId}/${messageId}.mp3`;
        const { error: uploadError } = await supabase.storage
            .from('voice-responses')
            .upload(filename, audioBuffer, {
                contentType: 'audio/mp3'
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('voice-responses')
            .getPublicUrl(filename);

        // TODO: Calculate actual duration from audio buffer
        const duration = 0;

        return {
            audioUrl: publicUrl,
            duration
        };
    }
}
