import { ElevenLabsClient } from './client';
import type { TextToSpeechRequest, SpeechToTextRequest, Voice } from './types';

export class VoiceAPI {
    private static instance: VoiceAPI;
    private client: ElevenLabsClient;
    private audioContext: AudioContext;

    private constructor() {
        this.client = ElevenLabsClient.getInstance();
        this.audioContext = new AudioContext();
    }

    public static getInstance(): VoiceAPI {
        if (!VoiceAPI.instance) {
            VoiceAPI.instance = new VoiceAPI();
        }
        return VoiceAPI.instance;
    }

    async speakText(text: string, voiceId?: string): Promise<void> {
        try {
            const request: TextToSpeechRequest = {
                text,
                voice_id: voiceId || '21m00Tcm4TlvDq8ikWAM', // Default voice
            };

            const audioBlob = await this.client.textToSpeech(request);
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start(0);

            return new Promise((resolve) => {
                source.onended = () => resolve();
            });
        } catch (error) {
            console.error('Error in speakText:', error);
            throw error;
        }
    }

    async startListening(options: {
        language?: string;
        onInterimResult?: (text: string) => void;
        onError?: (error: Error) => void;
    } = {}): Promise<string> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            return new Promise((resolve, reject) => {
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    try {
                        const request: SpeechToTextRequest = {
                            audio: audioBlob,
                            language: options.language,
                        };
                        const result = await this.client.speechToText(request);
                        resolve(result.text);
                    } catch (error) {
                        reject(error);
                    } finally {
                        stream.getTracks().forEach(track => track.stop());
                    }
                };

                // Stop recording after 10 seconds or when silence is detected
                setTimeout(() => mediaRecorder.stop(), 10000);
                mediaRecorder.start();
            });
        } catch (error) {
            console.error('Error in startListening:', error);
            throw error;
        }
    }

    async getAvailableVoices(): Promise<Voice[]> {
        return this.client.getVoices();
    }

    // Method to handle the complete voice interaction flow
    async handleVoiceInteraction(
        prompt: string,
        options: {
            voiceId?: string;
            language?: string;
            waitForResponse?: boolean;
            onInterimResult?: (text: string) => void;
        } = {}
    ): Promise<string | void> {
        // Speak the prompt
        await this.speakText(prompt, options.voiceId);

        // If we need to wait for a response, start listening
        if (options.waitForResponse) {
            return this.startListening({
                language: options.language,
                onInterimResult: options.onInterimResult,
            });
        }
    }
}
