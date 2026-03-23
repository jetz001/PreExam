const OpenAI = require('openai');

class AIProviderFactory {
    constructor() {
        this.currentProvider = process.env.DEFAULT_AI_PROVIDER || 'google';
        this.providers = {
            'google': {
                name: 'Google Gemini',
                model: 'gemini-1.5-flash',
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
                apiKey: process.env.GEMINI_API_KEY
            },
            'openai': {
                name: 'OpenAI GPT',
                model: 'gpt-4o-mini',
                baseURL: 'https://api.openai.com/v1',
                apiKey: process.env.OPENAI_API_KEY
            },
            'deepseek': {
                name: 'DeepSeek',
                model: 'deepseek-chat',
                baseURL: 'https://api.deepseek.com',
                apiKey: process.env.DEEPSEEK_API_KEY
            },
            'xai': {
                name: 'X.AI (Grok)',
                model: 'grok-beta',
                baseURL: 'https://api.x.ai/v1',
                apiKey: process.env.XAI_API_KEY
            },
            'openrouter': {
                name: 'OpenRouter',
                model: 'google/gemini-2.0-flash-001',
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: process.env.OPENROUTER_API_KEY
            }
        };
    }

    setProvider(providerId) {
        if (this.providers[providerId]) {
            this.currentProvider = providerId;
            return true;
        }
        return false;
    }

    getProvider() {
        return this.providers[this.currentProvider];
    }

    getInferenceClient() {
        const config = this.getProvider();
        if (!config || !config.apiKey) {
            throw new Error(`Provider ${this.currentProvider} is not configured (Missing API Key)`);
        }

        return new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL
        });
    }

    getAllProviders() {
        return Object.keys(this.providers).map(id => ({
            id,
            name: this.providers[id].name,
            model: this.providers[id].model,
            active: id === this.currentProvider
        }));
    }
}

module.exports = new AIProviderFactory();
