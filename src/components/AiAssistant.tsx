import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedFile, PluginConfig } from '../types';
import { useAiChat } from '../hooks/useAiChat';

import clsx from 'clsx';
// import { Send, Sparkles, X } from 'lucide-react'; // Assuming lucide or use SVGs

// Icons
const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const SparklesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const BotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
        <circle cx="12" cy="5" r="2"></circle>
        <path d="M12 7v4"></path>
        <line x1="8" y1="16" x2="8" y2="16"></line>
        <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
);

interface AiAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    files: GeneratedFile[];
    config: PluginConfig;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, files, config }) => {
    const { messages, sendMessage, isTyping } = useAiChat(files, config);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ai-sidebar panel card">
            <div className="ai-header">
                <div className="ai-title">
                    <span className="ai-icon-wrapper"><BotIcon /></span>
                    Arki AI
                    <span className="ai-badge">Experimental</span>
                </div>
                <button className="icon-btn" onClick={onClose} title="Close AI Assistant">
                    <CloseIcon />
                </button>
            </div>

            <div className="ai-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={clsx('chat-bubble', msg.role)}>
                        {msg.role === 'ai' && (
                            <div className="bot-avatar">
                                <SparklesIcon />
                            </div>
                        )}
                        <div className="message-content">
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i} dangerouslySetInnerHTML={{
                                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />
                            ))}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-bubble ai typing">
                        <div className="bot-avatar"><SparklesIcon /></div>
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-input-area">
                <div className="input-wrapper">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Arki..."
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <SendIcon />
                    </button>
                </div>
                <div className="ai-context-hint">
                    Arki can see your current file context.
                </div>
            </div>
        </div>
    );
};
