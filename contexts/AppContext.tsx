import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { mockStorage } from '../utils/storage'; // *** ייבוא חדש ***
import { AppCustomization, initialAppCustomizationData } from './UserSettingsContext'; // *** AppCustomization מיובא מ-UserSettingsContext ***


// --- Type Definitions (moved from index.tsx or new) ---
export interface ApiSetting {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  apiKey: string;
  apiUrl?: string;
  costs?: { input?: number; output?: number };
  isFreeTier?: boolean;
  modelSystemPrompt?: string;
  isDefault?: boolean;
  isValid?: boolean;
  lastValidated?: string;
}
export interface ChatMessageItem { role: string; content: string; timestamp: string; files?: any[], isError?: boolean } // Keep if ChatMessage uses it directly
export interface ChatHistory { id: string; messages: ChatMessageItem[]; cost?: number; tokens?: { incoming: number; outgoing: number }; lastUpdated: string; }
export interface TokenUsage { id: string; date: string; provider: string; modelId: string; incomingTokens: number; outgoingTokens: number; cost: number; }
// AppCustomization is now imported from UserSettingsContext


// --- Storage Instances (specific to AppContext or shared) ---
export const ApiSettingsStorage = mockStorage<ApiSetting>('api_settings_v3', []);
export const ChatHistoryStorage = mockStorage<ChatHistory>('chat_history_v2', {} as ChatHistory);
export const TokenUsageStorage = mockStorage<TokenUsage>('token_usage_v3', []);
// initialAppCustomizationData and AppCustomizationStorage are now primarily managed in UserSettingsContext, but AppContext might still read from AppCustomizationStorage for initial setup or specific needs.
// For clarity, AppCustomizationStorage is defined in UserSettingsContext where it's primarily mutated. AppContext can consume AppCustomization through userProfile from UserSettingsContext.
// If AppContext needs its own direct AppCustomizationStorage instance (e.g., for very early app init before UserSettingsProvider), it would be defined here.
// However, the current structure seems to imply AppCustomization is part of UserSettings.
// Let's assume AppCustomizationStorage is primarily managed by UserSettingsContext.
// We still need AppCustomizationStorage here IF AppContext directly writes to it or needs its initial value before UserSettingsProvider.
// Based on current usage, AppCustomization is read via userProfile from useUserSettings, so direct AppCustomizationStorage might not be needed in AppContext.
// However, initialAppCustomizationData is used in Onboarding. For consistency, let AppCustomizationStorage be defined where it's primarily managed (UserSettingsContext).
// AppContext's OnboardingWizard might use it for initial setup, so providing it or a direct reference could be needed.
// The `userProfile` from `useUserSettings` already provides `AppCustomization`.

// For the `OnboardingWizard` to potentially save an initial `AppCustomization` (like bot name, theme directly if not API keys)
// it would either need `setUserProfile` from `UserSettingsContext` (if onboarding is wrapped) or direct access to `AppCustomizationStorage`.
// Since `OnboardingWizard` is part of `AppContext` logic for showing/hiding, it seems `AppCustomizationStorage` might be needed here or `OnboardingWizard` refactored.
// Let's keep it defined in UserSettingsContext for now and assume Onboarding completion triggers updates via `setUserProfile`.
// The AppCustomizationStorage itself for reading is now in UserSettingsContext.

// --- API Service Definitions & Pricing (moved from index.tsx) ---
export const KNOWN_MODELS_PRICING: {[key: string]: {input: number, output: number, provider: string, contextWindow: number, note?: string, via?: string, isFreeTier?: boolean }} = {
    // OpenAI - Prices per 1M tokens
    'gpt-4o': { input: 5.00, output: 15.00, provider: 'openai', contextWindow: 128000 },
    'gpt-4-turbo': { input: 10.00, output: 30.00, provider: 'openai', contextWindow: 128000 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50, provider: 'openai', contextWindow: 16385, isFreeTier: true, note: "Often has free credits for new accounts or very low cost." },
    // Google Gemini - Prices per 1M tokens (characters for images)
    'gemini-1.5-pro-latest': { input: 3.50, output: 10.50, provider: 'google', contextWindow: 1000000 }, // Assuming 0-128k context pricing for simplicity. Real pricing is tiered.
    'gemini-1.5-flash-latest': { input: 0.35, output: 1.05, provider: 'google', contextWindow: 1000000, isFreeTier: true, note: "Generous free tier often available." },
    'gemini-1.0-pro': { input: 0.50, output: 1.50, provider: 'google', contextWindow: 32000, isFreeTier: true, note: "Older model, often with free/low cost access."},
    // Anthropic Claude - Prices per 1M tokens
    'claude-3-opus-20240229': { input: 15.00, output: 75.00, provider: 'anthropic', contextWindow: 200000 },
    'claude-3-sonnet-20240229': { input: 3.00, output: 15.00, provider: 'anthropic', contextWindow: 200000 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25, provider: 'anthropic', contextWindow: 200000, isFreeTier: true, note: "Check Anthropic for current free tier details." },
    'grok-1': { input: 1.00, output: 3.00, provider: 'grok', contextWindow: 8192, note: "Pricing and availability may vary." },
    'qwen-turbo': { input: 0.80, output: 2.40, provider: 'qwen', contextWindow: 32000, isFreeTier: true, note: "Pricing based on Alibaba Cloud, check for free tiers." }, // Also known as qwen-1.8b-chat
    'deepseek-chat': { input: 0.14, output: 0.28, provider: 'deepseek', contextWindow: 32000, isFreeTier: true, note: "Often promotes free quota." },
    'llama-3-sonar-small-32k-online': { provider: 'perplexity', input: 0.20, output: 1.00, contextWindow: 32000, isFreeTier: true, note: "Check Perplexity labs for API trial/free access." },
    'llama-3-sonar-large-32k-online': { provider: 'perplexity', input: 1.00, output: 5.00, contextWindow: 32000 },
    'llama3-8b-8192': { provider: 'meta', input: 0.20, output: 0.20, contextWindow: 8192, via: "Groq/Fireworks etc.", isFreeTier: true, note: "Groq API usually has a very generous free tier." }, // Llama 3 8B Instruct
    'llama3-70b-8192': { provider: 'meta', input: 1.00, output: 1.00, contextWindow: 8192, via: "Groq/Fireworks etc." }, // Llama 3 70B Instruct
    'azure-gpt-4o': { provider: 'microsoft', input: 5.00, output: 15.00, contextWindow: 128000, note: "Via Azure AI, similar to OpenAI" },
    'lachat-model': { provider: 'lachat', input: 1.00, output: 2.00, contextWindow: 8000, note: "Hypothetical pricing" },
};

export const PROVIDER_INFO: {[key: string]: {name: string, site: string, apiKeyUrl: string, videoUrl?: string, defaultModel: string, requiresEndpoint?: boolean, note?: string}} = {
    openai: { name: 'OpenAI', site: 'https://openai.com/product', apiKeyUrl: 'https://platform.openai.com/api-keys', videoUrl: 'https://www.youtube.com/watch?v=kYqRtjDBci8', defaultModel: 'gpt-3.5-turbo' }, // Default to free tier
    google: { name: 'Google (Gemini)', site: 'https://ai.google.dev/', apiKeyUrl: 'https://aistudio.google.com/app/apikey', videoUrl: 'https://www.youtube.com/watch?v=Như thế nào để có API Key của Gemini AI Studio', defaultModel: 'gemini-1.5-flash-latest' },
    anthropic: { name: 'Anthropic (Claude)', site: 'https://www.anthropic.com/product', apiKeyUrl: 'https://console.anthropic.com/settings/keys', videoUrl: 'https://www.youtube.com/watch?v=S0y6nN1S7eI', defaultModel: 'claude-3-haiku-20240307' },
    microsoft: { name: 'Microsoft (Azure AI / Copilot)', site: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service', apiKeyUrl: 'https://portal.azure.com/', videoUrl: 'https://www.youtube.com/watch?v=YOUR_AZURE_KEY_VIDEO_ID', defaultModel: 'azure-gpt-4o', requiresEndpoint: true },
    perplexity: { name: 'Perplexity AI', site: 'https://perplexity.ai/', apiKeyUrl: 'https://docs.perplexity.ai/reference/post_chat_completions', videoUrl: 'https://www.youtube.com/watch?v=YOUR_PERPLEXITY_KEY_VIDEO_ID', defaultModel: 'llama-3-sonar-small-32k-online' },
    meta: { name: 'Meta (Llama via 3rd party)', site: 'https://ai.meta.com/llama/', apiKeyUrl: 'https://console.groq.com/keys', videoUrl: 'https://www.youtube.com/watch?v=YOUR_LLAMA_KEY_VIDEO_ID', defaultModel: 'llama3-8b-8192', note: "Requires API key from a Llama provider (e.g., Groq, Fireworks AI, Together AI)." },
    grok: { name: 'Grok AI (xAI)', site: 'https://x.ai/', apiKeyUrl: 'https://x.ai/api-access', videoUrl: 'https://www.youtube.com/watch?v=YOUR_GROK_KEY_VIDEO_ID', defaultModel: 'grok-1', note: "API access might be limited." },
    qwen: { name: 'Alibaba (Qwen)', site: 'https://qwen.aliyun.com/', apiKeyUrl: 'https://www.aliyun.com/product/bailian', videoUrl: 'https://www.youtube.com/watch?v=YOUR_QWEN_KEY_VIDEO_ID', defaultModel: 'qwen-turbo', note: "Via Alibaba Cloud." },
    deepseek: { name: 'DeepSeek', site: 'https://www.deepseek.com/', apiKeyUrl: 'https://platform.deepseek.com/api_keys', videoUrl: 'https://www.youtube.com/watch?v=YOUR_DEEPSEEK_KEY_VIDEO_ID', defaultModel: 'deepseek-chat' },
    lachat: { name: 'LaChat', site: 'https://lachat.com/', apiKeyUrl: 'https://lachat.com/api-keys', videoUrl: 'https://www.youtube.com/watch?v=YOUR_LACHAT_KEY_VIDEO_ID', defaultModel: 'lachat-model', note: "Hypothetical provider for example." },
};

type LLMPromptPartText = { type: "text"; text: string };
type LLMPromptPartImageUrl = { type: "image_url"; image_url: { url: string } };
type LLMPromptPartInlineData = { inline_data: { mime_type: string; data: string } };
type LLMPromptPartImageSource = { type: "image"; source: { type: "base64"; media_type: string; data: string } };

type LLMPromptPart =
  | LLMPromptPartText
  | LLMPromptPartImageUrl
  | LLMPromptPartInlineData
  | LLMPromptPartImageSource;

const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit = {}, timeout = 60000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    }
};

interface InvokeLLMParams {
    modelConfig: ApiSetting;
    prompt: string;
    systemPrompt?: string;
    conversationHistory?: ChatMessageItem[];
    files?: Array<{ id: string; name: string; type: string; dataUrl: string; content: string }>;
    agentToolResults?: any;
}

export const InvokeLLM = async ({ modelConfig, prompt, systemPrompt, conversationHistory = [], files = [], agentToolResults = null }: InvokeLLMParams) => {
    if (!modelConfig || !modelConfig.apiKey || !modelConfig.modelId) {
        return { error: "API Key or Model ID not configured for the active model." };
    }

    const { provider, modelId, apiKey, apiUrl, costs } = modelConfig;
    const effectiveSystemPrompt = [
        systemPrompt,
        modelConfig.modelSystemPrompt,
    ].filter(Boolean).join('\n\n');

    let requestBody: any = {};
    let endpoint = apiUrl || '';
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    const messagesForApi: any[] = [];
    if (effectiveSystemPrompt) {
        if (provider === 'openai' || provider === 'anthropic' || provider === 'perplexity' || provider === 'meta' || provider === 'grok' || provider === 'qwen' || provider === 'deepseek' || provider === 'microsoft') {
            messagesForApi.push({ role: "system", content: effectiveSystemPrompt });
        }
    }

    conversationHistory.forEach(msg => {
        messagesForApi.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    });

    let userPromptText = prompt;
    files.forEach(file => {
        userPromptText += `\n\n--- Attached File: ${file.name} ---\n${file.content}\n--- End of File ---`;
    });

    const currentUserPromptParts: LLMPromptPart[] = [{ type: "text", text: userPromptText }];

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            if (provider === 'openai' || provider === 'perplexity' || provider === 'meta' || provider === 'microsoft') {
                if (!currentUserPromptParts.find(p => ('type' in p && p.type === "image_url") && p.image_url.url === file.dataUrl)) {
                     currentUserPromptParts.push({ type: "image_url", image_url: { url: file.dataUrl } });
                }
            } else if (provider === 'google') {
                const [header, base64Data] = file.dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
                 if (!currentUserPromptParts.find(p => 'inline_data' in p && p.inline_data.data === base64Data)) {
                    currentUserPromptParts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
                }
            } else if (provider === 'anthropic') {
                 const [header, base64Data] = file.dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
                if (!currentUserPromptParts.find(p => ('type' in p && p.type === "image") && p.source.data === base64Data)) {
                    currentUserPromptParts.push({ type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } });
                }
            }
        }
    });

    if (agentToolResults) {
        const firstTextPart = currentUserPromptParts.find((p): p is LLMPromptPartText => 'type' in p && p.type === "text");
        if (firstTextPart) {
            firstTextPart.text += `\n\n--- Tool Results ---\n${JSON.stringify(agentToolResults)}\n--- End of Tool Results ---`;
        } else {
             currentUserPromptParts.push({ type: "text", text: `\n\n--- Tool Results ---\n${JSON.stringify(agentToolResults)}\n--- End of Tool Results ---`});
        }
    }

    type OpenAIContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

    if (provider === 'openai' || provider === 'perplexity' || provider === 'meta' || provider === 'grok' || provider === 'qwen' || provider === 'deepseek' || provider === 'microsoft') {
        if (provider === 'microsoft' && !(apiUrl||'').includes('openai.azure.com')) {
             return { error: "Azure OpenAI requires a specific endpoint URL in model settings."};
        }
        endpoint = endpoint || (provider === 'microsoft' ? '' : `https://api.proxy-gemini.com/${provider}/v1/chat/completions`);
        (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`;

        const openAIMessagesPayload = [...messagesForApi];

        let openAIUserContent: string | OpenAIContentPart[];
        const textPartsContent = currentUserPromptParts
            .filter((p): p is LLMPromptPartText => 'type' in p && p.type === "text")
            .map(p => p.text);
        const imagePartsForOpenAI = currentUserPromptParts
            .filter((p): p is LLMPromptPartImageUrl => 'type' in p && p.type === "image_url");

        if (imagePartsForOpenAI.length > 0) {
            const contentArray: OpenAIContentPart[] = [];
            if (textPartsContent.join("\n").trim()) {
                contentArray.push({ type: "text", text: textPartsContent.join("\n") });
            }
            imagePartsForOpenAI.forEach(part => contentArray.push(part));
            openAIUserContent = contentArray;
        } else {
            openAIUserContent = textPartsContent.join("\n");
        }

        openAIMessagesPayload.push({role: "user", content: openAIUserContent });

        requestBody = { model: modelId, messages: openAIMessagesPayload, max_tokens: (modelConfig as any).max_tokens || 4000, temperature: (modelConfig as any).temperature || 0.7 };

    } else if (provider === 'google') {
        endpoint = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        const geminiContents: any[] = [];
        messagesForApi.filter(m => m.role !== 'system').forEach(msg => {
             geminiContents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] });
        });

        const currentGeminiUserParts: any[] = [];
        currentUserPromptParts.forEach(part => {
            if ('type' in part && part.type === "text") { // LLMPromptPartText
                currentGeminiUserParts.push({ text: part.text });
            } else if ('inline_data' in part) { // LLMPromptPartInlineData
                currentGeminiUserParts.push({ inline_data: part.inline_data });
            }
        });
        geminiContents.push({ role: "user", parts: currentGeminiUserParts });

        requestBody = { contents: geminiContents, generationConfig: { temperature: (modelConfig as any).temperature || 0.7, maxOutputTokens: (modelConfig as any).max_tokens || 2048 } };
        if (effectiveSystemPrompt) {
            requestBody.system_instruction = { parts: [{ text: effectiveSystemPrompt }] };
        }

    } else if (provider === 'anthropic') {
        endpoint = endpoint || 'https://api.proxy-gemini.com/anthropic/v1/messages';
        (headers as Record<string, string>)['x-api-key'] = apiKey;
        (headers as Record<string, string>)['anthropic-version'] = '2023-06-01';

        const anthropicMessagesPayload = messagesForApi.filter(m => m.role !== 'system').map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const currentAnthropicUserParts: any[] = [];
         currentUserPromptParts.forEach(part => {
            if ('type' in part && part.type === "text") { // LLMPromptPartText
                currentAnthropicUserParts.push({ type: "text", text: part.text });
            } else if ('type' in part && part.type === "image" && part.source) { // LLMPromptPartImageSource
                currentAnthropicUserParts.push({ type: "image", source: part.source });
            }
        });
        anthropicMessagesPayload.push({ role: "user", content: currentAnthropicUserParts });

        requestBody = { model: modelId, messages: anthropicMessagesPayload, max_tokens: (modelConfig as any).max_tokens || 4096, temperature: (modelConfig as any).temperature || 0.7 };
        if (effectiveSystemPrompt) {
            requestBody.system = effectiveSystemPrompt;
        }
    } else {
        return { error: `Provider "${provider}" is not supported or misconfigured.` };
    }

    try {
        const response = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("API Error Response:", errorData);
            const detail = errorData.error?.message || errorData.message || JSON.stringify(errorData);
            return { error: `API Error (${response.status}): ${detail}` };
        }

        const data = await response.json();
        let messageContent = '';
        let usage = { incomingTokens: 0, outgoingTokens: 0 };

        usage.outgoingTokens = JSON.stringify(requestBody).length / 4;

        if (provider === 'openai' || provider === 'perplexity' || provider === 'meta' || provider === 'grok' || provider === 'qwen' || provider === 'deepseek' || provider === 'microsoft') {
            messageContent = data.choices?.[0]?.message?.content || '';
            if (data.usage) {
                usage.incomingTokens = data.usage.completion_tokens || 0;
                usage.outgoingTokens = data.usage.prompt_tokens || 0;
            } else {
                 usage.incomingTokens = messageContent.length / 4;
            }
        } else if (provider === 'google') {
            messageContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
             if (data.usageMetadata) {
                usage.incomingTokens = data.usageMetadata.candidatesTokenCount || 0;
                usage.outgoingTokens = data.usageMetadata.promptTokenCount || 0;
            } else {
                usage.incomingTokens = messageContent.length / 4;
            }
        } else if (provider === 'anthropic') {
            messageContent = data.content?.[0]?.text || '';
            if (data.usage) {
                usage.incomingTokens = data.usage.output_tokens || 0;
                usage.outgoingTokens = data.usage.input_tokens || 0;
            } else {
                usage.incomingTokens = messageContent.length / 4;
            }
        }

        let cost = 0;
        const modelPricing = costs || KNOWN_MODELS_PRICING[modelId] || {};
        if (modelPricing.input && modelPricing.output) {
            cost = (usage.outgoingTokens / 1000000 * modelPricing.input) + (usage.incomingTokens / 1000000 * modelPricing.output);
        } else if ((modelConfig as any).costPerCall) {
            cost = (modelConfig as any).costPerCall;
        }

        return { message: messageContent, usage, cost, modelId: modelId, provider: provider };

    } catch (error: any) {
        console.error("Fetch Error:", error);
        return { error: error.message || "Network error or CORS issue. Check console and proxy." };
    }
};

export const validateApiKey = async (modelConfig: ApiSetting) => {
    const validationResult = await InvokeLLM({
        modelConfig,
        prompt: "Hello",
        systemPrompt: "You are a validation AI. Respond with a short confirmation.",
        conversationHistory: [],
    });

    if (validationResult.error) {
        return { isValid: false, error: validationResult.error };
    }
    return { isValid: true, error: null };
};


// --- AppContext Definition ---
interface AppContextType {
    lang: string;
    theme: string;
    changeLanguage: (lang: string) => void;
    toggleTheme: () => void;
    apiSettings: ApiSetting[];
    loadApiSettings: () => Promise<void>;
    recordTokenUsage: (provider: string, modelId: string, incoming: number, outgoing: number, cost: number) => Promise<void>;
    tokenUsage: TokenUsage[];
    loadTokenUsage: () => Promise<void>;
    currentPage: string;
    setCurrentPageGlobal: (page: string) => void;
    showOnboarding: boolean;
    setShowOnboarding: (show: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    activeVoice: SpeechSynthesisVoice | null;
    setActiveVoice: (voice: SpeechSynthesisVoice | null) => void;
    availableVoices: SpeechSynthesisVoice[];
    loadVoices: () => void;
    speak: (text: string, onEndCallback?: () => void) => void;
    stopSpeak: () => void;
    isSpeaking: boolean;
    continuousConversation: boolean;
    setContinuousConversation: (continuous: boolean) => void;
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
    transcript: string;
    setTranscript: React.Dispatch<React.SetStateAction<string>>;
    clearTranscript: () => void;
    errorDialog: { isOpen: boolean; title: string; message: string; };
    setErrorDialog: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; message: string; }>>;
    openErrorDialog: (title: string, message: string) => void;
    // Expose storages and utils if they are intrinsic to AppContext consumers
    ApiSettingsStorage: typeof ApiSettingsStorage;
    ChatHistoryStorage: typeof ChatHistoryStorage;
    TokenUsageStorage: typeof TokenUsageStorage;
    // AppCustomizationStorage: typeof AppCustomizationStorage; // Managed in UserSettingsContext
    validateApiKey: typeof validateApiKey;
    InvokeLLM: typeof InvokeLLM; // Expose if components need to call it directly
}
const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'he');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [apiSettings, setApiSettingsState] = useState<ApiSetting[]>([]);
    const [tokenUsage, setTokenUsageState] = useState<TokenUsage[]>([]);
    const [currentPage, setCurrentPageGlobal] = useState('chat');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [continuousConversation, setContinuousConversation] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '' });

    const openErrorDialog = (title: string, message: string) => {
        setErrorDialog({ isOpen: true, title, message });
    };

    const loadVoices = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        const filteredVoices = voices.filter(voice => voice.lang.startsWith(lang));
        setAvailableVoices(filteredVoices);
        
        // Try to get saved voice URI from localStorage (AppCustomization is in UserSettingsContext)
        const storedCustomization = localStorage.getItem('app_customization_v2'); // UserSettingsContext key
        const savedVoiceURI = storedCustomization ? (JSON.parse(storedCustomization) as AppCustomization).botVoiceURI : null;

        if (savedVoiceURI) {
            const foundVoice = filteredVoices.find(v => v.voiceURI === savedVoiceURI);
            if (foundVoice) setActiveVoice(foundVoice);
            else if (filteredVoices.length > 0) setActiveVoice(filteredVoices[0]);
        } else if (filteredVoices.length > 0) {
            setActiveVoice(filteredVoices[0]);
        }
    }, [lang]);

    useEffect(() => {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [loadVoices]);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
        localStorage.setItem('app_lang', lang);
        loadVoices();
    }, [lang, loadVoices]);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const loadApiSettings = async () => {
        const settings = await ApiSettingsStorage.list();
        setApiSettingsState(settings.sort((a,b) => (a.isDefault === b.isDefault) ? 0 : a.isDefault ? -1 : 1));
        if (settings.length === 0 || !settings.some(s => s.isValid)) {
             setShowOnboarding(true);
        } else {
             setShowOnboarding(false);
        }
    };

    const loadTokenUsage = async () => setTokenUsageState(await TokenUsageStorage.list());

    useEffect(() => {
        loadApiSettings();
        loadTokenUsage();
    }, []);

    const recordTokenUsage = async (provider: string, modelId: string, incoming: number, outgoing: number, cost: number) => {
        const today = new Date().toISOString();
        await TokenUsageStorage.upsert({
            id: `usage-${Date.now()}-${Math.random()}`,
            date: today,
            provider,
            modelId,
            incomingTokens: incoming,
            outgoingTokens: outgoing,
            cost: cost || 0,
        });
        loadTokenUsage();
    };

    const speak = (text: string, onEndCallback?: () => void) => {
        if (!text || typeof window.speechSynthesis === 'undefined') {
            console.warn("Speech synthesis not supported or no text to speak.");
            if (onEndCallback) onEndCallback();
            return;
        }

        let currentVoices = window.speechSynthesis.getVoices();
        if (currentVoices.length === 0) {
            console.warn("Voices not loaded yet, trying to fetch them...");
            if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
                window.speechSynthesis.onvoiceschanged = () => {
                    currentVoices = window.speechSynthesis.getVoices();
                    if (currentVoices.length > 0) {
                        loadVoices();
                        speak(text, onEndCallback);
                    } else {
                        openErrorDialog(lang === 'he' ? "שגיאת קול" : "Voice Error", lang === 'he' ? "לא נטענו קולות גם לאחר ניסיון טעינה מחדש." : "Voices not loaded even after attempting a reload.");
                        if (onEndCallback) onEndCallback();
                    }
                };
                setTimeout(() => {
                    currentVoices = window.speechSynthesis.getVoices();
                    if(currentVoices.length === 0) {
                         console.warn("Still no voices after delay.");
                         loadVoices();
                    }
                 }, 100);
            } else {
                 openErrorDialog(lang === 'he' ? "שגיאת קול" : "Voice Error", lang === 'he' ? "לא נטענו קולות." : "Voices not loaded.");
                 if (onEndCallback) onEndCallback();
                 return;
            }
        }

        const utterance = new SpeechSynthesisUtterance(text);
        let targetVoice: SpeechSynthesisVoice | undefined | null = activeVoice;

        if (!targetVoice || !targetVoice.lang.startsWith(lang)) {
            targetVoice = availableVoices.find(v => v.lang.startsWith(lang) && v.default) ||
                          availableVoices.find(v => v.lang.startsWith(lang));
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
        } else {
             openErrorDialog(
                lang === 'he' ? "אין קול זמין" : "No Voice Available",
                lang === 'he' ? `לא נמצא קול עבור השפה ${lang}.` : `No voice found for ${lang}.`
            );
            if (onEndCallback) onEndCallback();
            return;
        }

        utterance.lang = lang;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error, event);
            setIsSpeaking(false);
            openErrorDialog(
                lang === 'he' ? "שגיאת דיבור" : "Speech Error",
                lang === 'he' ? `לא ניתן היה להשמיע את הטקסט: ${event.error}` : `Could not speak the text: ${event.error}`
            );
            if (onEndCallback) onEndCallback();
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeak = () => {
        if (typeof window.speechSynthesis === 'undefined') return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const recognitionRef = useRef<any>(null);

    const startListening = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
             openErrorDialog(lang === 'he' ? "שגיאת זיהוי דיבור" : "Speech Recognition Error", lang === 'he' ? "הדפדפן שלך אינו תומך בזיהוי דיבור." : "Your browser does not support speech recognition.");
            return;
        }
        if (!recognitionRef.current) {
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = continuousConversation;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = lang;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (continuousConversation && recognitionRef.current && recognitionRef.current.manualStop !== true) {
                    recognitionRef.current.start();
                } else if (recognitionRef.current) {
                    recognitionRef.current.manualStop = false;
                }
            };
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                 if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                     openErrorDialog(lang === 'he' ? "הרשאת מיקרופון נדחתה" : "Microphone Permission Denied", lang === 'he' ? "הגישה למיקרופון נדחתה." : "Microphone access was denied.");
                } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                     openErrorDialog(lang === 'he' ? "שגיאת זיהוי דיבור" : "Speech Recognition Error", event.error);
                }
            };
            recognitionRef.current.onresult = (event: any) => {
                let finalTranscriptPart = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscriptPart += event.results[i][0].transcript;
                    }
                }
                if (finalTranscriptPart) {
                    setTranscript(prev => prev + finalTranscriptPart + (continuousConversation ? "" : " "));
                }
            };
        }

        if (recognitionRef.current) {
             recognitionRef.current.continuous = continuousConversation;
        }

        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.manualStop = false;
                recognitionRef.current.start();
            } catch (e: any) {
                console.warn("Could not start recognition:", e.message);
                if (e.name !== 'InvalidStateError') {
                    openErrorDialog(lang === 'he' ? "שגיאת הפעלה" : "Start Error", lang === 'he' ? "לא ניתן היה להתחיל זיהוי דיבור." : "Could not start speech recognition.");
                }
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.manualStop = true;
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const clearTranscript = () => setTranscript("");

    const value: AppContextType = {
        lang, theme, changeLanguage: setLang, toggleTheme,
        apiSettings, loadApiSettings, recordTokenUsage,
        tokenUsage, loadTokenUsage: loadTokenUsage,
        currentPage, setCurrentPageGlobal,
        showOnboarding, setShowOnboarding,
        isSidebarOpen, setIsSidebarOpen,
        activeVoice, setActiveVoice, availableVoices, loadVoices, speak, stopSpeak, isSpeaking,
        continuousConversation, setContinuousConversation,
        isListening, startListening, stopListening, transcript, setTranscript, clearTranscript,
        errorDialog, setErrorDialog, openErrorDialog,
        ApiSettingsStorage, ChatHistoryStorage, TokenUsageStorage, // AppCustomizationStorage removed from direct exposure here
        validateApiKey, InvokeLLM
    };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}