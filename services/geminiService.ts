
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage, Blob } from "@google/genai";
import { GroundingSource } from "../types";

// A API_KEY deve estar configurada no painel do Netlify
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Aviso: API_KEY (Gemini) não encontrada nas variáveis de ambiente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Chat Text/Image Service
 */
export const sendMessageToGemini = async (
  prompt: string, 
  imageBase64?: string
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  const ai = getClient();
  if (!ai) throw new Error("Serviço de IA não configurado.");
  
  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg', 
      },
    });
  }
  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: `Você é o Guia de Suporte Técnico do Sistema Culto Profético da ICM.
Sua única função é explicar como utilizar as ferramentas deste aplicativo.
O sistema possui:
1. Lista de Louvores: Busca de hinos (Coletânea e Cias), busca por voz e geração de cartaz para WhatsApp.
2. Registro de Dons: Cadastro de dons espirituais entregues no culto.
3. Dados do Culto: Relatório completo de frequência (membros, visitantes, obreiros) e geração de imagem para relatório.
4. Outros Sistemas: Oração Ininterrupta e links sociais.

REGRAS RÍGIDAS:
- Se o usuário perguntar sobre Bíblia, Teologia ou qualquer assunto fora do uso do app, responda educadamente: "Como assistente de suporte técnico, meu foco é ajudar você a navegar nas funcionalidades deste sistema. Para dúvidas bíblicas, consulte o seu pastor ou diácono responsável."
- Seja conciso, técnico e prestativo.`,
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Fonte de Ajuda",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { 
      text: response.text || "Não consegui processar sua dúvida sobre o sistema.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw new Error(error.message || "Falha na conexão com o suporte do sistema.");
  }
};

/**
 * Live Audio Session Manager
 */
export class LiveSessionManager {
  private sessionPromise: Promise<any> | null = null;
  private onVolume: (v: number) => void;
  private onClose: () => void;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(onVolume: (v: number) => void, onClose: () => void) {
    this.onVolume = onVolume;
    this.onClose = onClose;
  }

  async connect() {
    const ai = getClient();
    if (!ai) throw new Error("AI Key não configurada.");
    
    this.audioCtx = new AudioContext({ sampleRate: 16000 });
    this.outputCtx = new AudioContext({ sampleRate: 24000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = this.audioCtx!.createMediaStreamSource(this.stream!);
          const processor = this.audioCtx!.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            this.onVolume(Math.sqrt(sum / inputData.length));
            
            const pcmBlob = this.createBlob(inputData);
            this.sessionPromise!.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(processor);
          processor.connect(this.audioCtx!.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64 && this.outputCtx) {
            const buffer = await this.decodeAudio(base64);
            this.nextStartTime = Math.max(this.nextStartTime, this.outputCtx.currentTime);
            const source = this.outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.outputCtx.destination);
            source.start(this.nextStartTime);
            this.nextStartTime += buffer.duration;
            this.sources.add(source);
          }
          if (msg.serverContent?.interrupted) {
            this.sources.forEach(s => s.stop());
            this.sources.clear();
            this.nextStartTime = 0;
          }
        },
        onclose: () => this.onClose(),
        onerror: (e) => console.error("Live Error:", e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: "Você é o suporte por voz do app. Explique apenas como usar o sistema. Se o usuário perguntar sobre a Bíblia, diga que você só ajuda com o sistema."
      }
    });
  }

  disconnect() {
    this.sessionPromise?.then(s => s.close());
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioCtx?.close();
    this.outputCtx?.close();
  }

  private createBlob(data: Float32Array): Blob {
    const int16 = new Int16Array(data.length);
    for(let i=0; i<data.length; i++) int16[i] = data[i] * 32768;
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    for(let i=0; i<bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  }

  private async decodeAudio(base64: string): Promise<AudioBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = this.outputCtx!.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for(let i=0; i<dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  }
}
