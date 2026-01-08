import { useState, useCallback } from 'react';
import type { GeneratedFile, PluginConfig } from '../types';

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

export const useAiChat = (files: GeneratedFile[], config: PluginConfig) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: "Hello! I'm Arki, your AI assistant. I can help you optimize your configuration or explain the generated code. How can I help you today?",
            timestamp: Date.now()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const generateResponse = (userMessage: string) => {
        const lowerMsg = userMessage.toLowerCase();

        if (lowerMsg.includes('optimize') || lowerMsg.includes('improvement')) {
            return `Based on your current setup using **${config.buildApproach}**, here are some optimization tips:
- Ensure your \`tangible.config.js\` excludes unnecessary entry points to speed up builds.
- Use \`React.memo\` for static components in your React modules.
- Check if your PHP autoloader is optimized for production.`;
        }

        if (lowerMsg.includes('error') || lowerMsg.includes('bug')) {
            return "I can help debug. Please paste the error message or point me to the file where you suspect the issue lies.";
        }

        if (lowerMsg.includes('create') || lowerMsg.includes('add')) {
            return "To add a new module, you can currently use the 'Modules' list in the left sidebar. I'm noting your request to support natural language generation for new modules in the future!";
        }

        return "I see. I'm currently in experimental mode, but I can help you review your generated files. Try asking about 'optimizations' or specific configuration details.";
    };

    const sendMessage = useCallback(async (content: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate network delay
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: generateResponse(content),
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    }, [files, config]);

    return {
        messages,
        sendMessage,
        isTyping
    };
};
