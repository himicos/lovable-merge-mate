export interface Voice {
    voice_id: string;
    name: string;
    category: string;
}

export interface TextToSpeechRequest {
    text: string;
    voice_id: string;
    model_id?: string;
    voice_settings?: {
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
    };
}

export interface SpeechToTextRequest {
    audio: Blob;
    language?: string;
}

export interface SpeechToTextResponse {
    text: string;
    confidence: number;
}

export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
}
