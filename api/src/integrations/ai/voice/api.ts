import axios from 'axios';
import { db } from '../../../services/database/client.js';

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
        this.apiKey = process.env.ELEVENLABS_API_KEY || null;

        if (!this.apiKey) {
            throw new Error('ElevenLabs API key not found in environment variables');
        }
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
        await db.query(`
            INSERT INTO message_responses (user_id, message_id, audio_url, duration, created_at)
            VALUES ($1, $2, $3, $4, $5)
        `, [this.userId, data.messageId, data.audioUrl, data.duration, new Date().toISOString()]);
    }

    private async uploadToStorage(audioBuffer: Buffer, messageId: string): Promise<{ audioUrl: string; duration: number }> {
        // For now, return a placeholder URL - file storage can be implemented later
        const audioUrl = `/temp/audio/${this.userId}/${messageId}.mp3`;
        
        // TODO: Implement proper file storage (local filesystem or cloud storage)
        // TODO: Calculate actual duration from audio buffer
        const duration = 0;

        return {
            audioUrl,
            duration
        };
    }
}
