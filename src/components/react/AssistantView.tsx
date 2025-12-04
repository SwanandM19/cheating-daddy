import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

interface SavedResponse {
    response: string;
    timestamp: string;
    profile: string;
}

interface AssistantViewProps {
    responses: string[];
    currentResponseIndex: number;
    selectedProfile: string;
    onSendText: (message: string) => Promise<void>;
    onResponseIndexChanged: (index: number) => void;
}

const profileNames: Record<string, string> = {
    interview: 'Job Interview',
    sales: 'Sales Call',
    meeting: 'Business Meeting',
    presentation: 'Presentation',
    negotiation: 'Negotiation',
    exam: 'Exam Assistant',
};

export function AssistantView({
    responses,
    currentResponseIndex,
    selectedProfile,
    onSendText,
    onResponseIndexChanged,
}: AssistantViewProps) {
    const [textInput, setTextInput] = useState('');
    const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);
    const responseContainerRef = useRef<HTMLDivElement>(null);

    // Load saved responses from localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('savedResponses') || '[]');
            setSavedResponses(saved);
        } catch {
            setSavedResponses([]);
        }
    }, []);

    // Load font size
    useEffect(() => {
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize !== null) {
            const fontSizeValue = parseInt(fontSize, 10) || 20;
            document.documentElement.style.setProperty('--response-font-size', `${fontSizeValue}px`);
        }
    }, []);

    const getCurrentResponse = useCallback(() => {
        return responses.length > 0 && currentResponseIndex >= 0
            ? responses[currentResponseIndex]
            : `Hey, I'm listening to your ${profileNames[selectedProfile] || 'session'}?`;
    }, [responses, currentResponseIndex, selectedProfile]);

    const renderMarkdown = useCallback((content: string): string => {
        if (typeof window !== 'undefined' && (window as any).marked) {
            try {
                (window as any).marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false,
                });
                return (window as any).marked.parse(content);
            } catch (error) {
                console.warn('Error parsing markdown:', error);
                return content;
            }
        }
        return content;
    }, []);

    // Update response content
    useEffect(() => {
        const container = responseContainerRef.current;
        if (!container) return;

        const currentResponse = getCurrentResponse();
        const renderedResponse = renderMarkdown(currentResponse);
        container.innerHTML = renderedResponse;
    }, [responses, currentResponseIndex, getCurrentResponse, renderMarkdown]);

    // IPC listeners for keyboard shortcuts
    useEffect(() => {
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');

            const handlePreviousResponse = () => navigateToPreviousResponse();
            const handleNextResponse = () => navigateToNextResponse();
            const handleScrollUp = () => scrollResponseUp();
            const handleScrollDown = () => scrollResponseDown();

            ipcRenderer.on('navigate-previous-response', handlePreviousResponse);
            ipcRenderer.on('navigate-next-response', handleNextResponse);
            ipcRenderer.on('scroll-response-up', handleScrollUp);
            ipcRenderer.on('scroll-response-down', handleScrollDown);

            return () => {
                ipcRenderer.removeListener('navigate-previous-response', handlePreviousResponse);
                ipcRenderer.removeListener('navigate-next-response', handleNextResponse);
                ipcRenderer.removeListener('scroll-response-up', handleScrollUp);
                ipcRenderer.removeListener('scroll-response-down', handleScrollDown);
            };
        }
    }, [currentResponseIndex, responses.length]);

    const navigateToPreviousResponse = () => {
        if (currentResponseIndex > 0) {
            onResponseIndexChanged(currentResponseIndex - 1);
        }
    };

    const navigateToNextResponse = () => {
        if (currentResponseIndex < responses.length - 1) {
            onResponseIndexChanged(currentResponseIndex + 1);
        }
    };

    const scrollResponseUp = () => {
        const container = responseContainerRef.current;
        if (container) {
            const scrollAmount = container.clientHeight * 0.3;
            container.scrollTop = Math.max(0, container.scrollTop - scrollAmount);
        }
    };

    const scrollResponseDown = () => {
        const container = responseContainerRef.current;
        if (container) {
            const scrollAmount = container.clientHeight * 0.3;
            container.scrollTop = Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + scrollAmount);
        }
    };

    const handleSendText = async () => {
        if (textInput.trim()) {
            const message = textInput.trim();
            setTextInput('');
            await onSendText(message);
        }
    };

    const handleTextKeydown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };

    const saveCurrentResponse = () => {
        const currentResponse = getCurrentResponse();
        if (currentResponse && !isResponseSaved()) {
            const newSavedResponses = [
                ...savedResponses,
                {
                    response: currentResponse,
                    timestamp: new Date().toISOString(),
                    profile: selectedProfile,
                },
            ];
            setSavedResponses(newSavedResponses);
            localStorage.setItem('savedResponses', JSON.stringify(newSavedResponses));
        }
    };

    const isResponseSaved = () => {
        const currentResponse = getCurrentResponse();
        return savedResponses.some(saved => saved.response === currentResponse);
    };

    const getResponseCounter = () => {
        return responses.length > 0 ? `${currentResponseIndex + 1}/${responses.length}` : '';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Response Container */}
            <div
                ref={responseContainerRef}
                className={cn(
                    "flex-1 overflow-y-auto rounded-xl p-5",
                    "glass-panel border border-white/20",
                    "text-[length:var(--response-font-size,18px)] leading-relaxed",
                    "select-text cursor-text scroll-smooth",
                    // Markdown styles
                    "[&_h1]:text-[1.8em] [&_h1]:font-semibold [&_h1]:my-4 [&_h1]:text-white",
                    "[&_h2]:text-[1.5em] [&_h2]:font-semibold [&_h2]:my-3 [&_h2]:text-white",
                    "[&_h3]:text-[1.3em] [&_h3]:font-semibold [&_h3]:my-2 [&_h3]:text-white",
                    "[&_p]:my-3 [&_p]:text-white/90",
                    "[&_ul]:my-3 [&_ul]:pl-8 [&_ol]:my-3 [&_ol]:pl-8",
                    "[&_li]:my-1",
                    "[&_blockquote]:my-4 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-500/10 [&_blockquote]:italic",
                    "[&_code]:bg-blue-900/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[0.85em]",
                    "[&_pre]:bg-black/30 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4",
                    "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
                    "[&_a]:text-blue-400 [&_a]:no-underline [&_a:hover]:underline",
                    "[&_strong]:font-semibold [&_strong]:text-white",
                    "[&_table]:border-collapse [&_table]:w-full [&_table]:my-4",
                    "[&_th]:border [&_th]:border-white/20 [&_th]:p-2 [&_th]:bg-black/30",
                    "[&_td]:border [&_td]:border-white/20 [&_td]:p-2"
                )}
            />

            {/* Input Container */}
            <div className="flex gap-2.5 mt-2.5 items-center">
                {/* Previous Button */}
                <Button
                    variant="glass"
                    size="icon"
                    className="rounded-full w-9 h-9"
                    onClick={navigateToPreviousResponse}
                    disabled={currentResponseIndex <= 0}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Response Counter */}
                {responses.length > 0 && (
                    <span className="text-xs text-white/50 whitespace-nowrap min-w-[60px] text-center">
                        {getResponseCounter()}
                    </span>
                )}

                {/* Save Button */}
                <Button
                    variant="glass"
                    size="icon"
                    className={cn("rounded-full w-9 h-9", isResponseSaved() && "text-green-500")}
                    onClick={saveCurrentResponse}
                    title={isResponseSaved() ? 'Response saved' : 'Save this response'}
                >
                    <Save className="w-5 h-5" />
                </Button>

                {/* Text Input */}
                <Input
                    type="text"
                    placeholder="Type a message to the AI..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleTextKeydown}
                    className="flex-1 glass-panel border-white/20 bg-white/5"
                />

                {/* Send Button */}
                <Button
                    variant="glass"
                    size="icon"
                    className="rounded-full w-9 h-9"
                    onClick={handleSendText}
                >
                    <Send className="w-5 h-5" />
                </Button>

                {/* Next Button */}
                <Button
                    variant="glass"
                    size="icon"
                    className="rounded-full w-9 h-9"
                    onClick={navigateToNextResponse}
                    disabled={currentResponseIndex >= responses.length - 1}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
