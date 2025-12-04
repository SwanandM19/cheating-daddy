import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Keybinds {
    [key: string]: string;
}

interface HelpViewProps {
    onExternalLinkClick: (url: string) => void;
}

export function HelpView({ onExternalLinkClick }: HelpViewProps) {
    const [keybinds, setKeybinds] = useState<Keybinds>({});

    const getDefaultKeybinds = useCallback((): Keybinds => {
        const isMac = (window as any).cheddar?.isMacOS || navigator.platform.includes('Mac');
        return {
            moveUp: isMac ? 'Alt+Up' : 'Ctrl+Up',
            moveDown: isMac ? 'Alt+Down' : 'Ctrl+Down',
            moveLeft: isMac ? 'Alt+Left' : 'Ctrl+Left',
            moveRight: isMac ? 'Alt+Right' : 'Ctrl+Right',
            toggleVisibility: isMac ? 'Cmd+\\' : 'Ctrl+\\',
            toggleClickThrough: isMac ? 'Cmd+M' : 'Ctrl+M',
            nextStep: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
            previousResponse: isMac ? 'Cmd+[' : 'Ctrl+[',
            nextResponse: isMac ? 'Cmd+]' : 'Ctrl+]',
            scrollUp: isMac ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up',
            scrollDown: isMac ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down',
        };
    }, []);

    useEffect(() => {
        const savedKeybinds = localStorage.getItem('customKeybinds');
        if (savedKeybinds) {
            try {
                setKeybinds({ ...getDefaultKeybinds(), ...JSON.parse(savedKeybinds) });
            } catch {
                setKeybinds(getDefaultKeybinds());
            }
        } else {
            setKeybinds(getDefaultKeybinds());
        }
    }, [getDefaultKeybinds]);

    const formatKeybind = (keybind: string) => {
        return keybind.split('+').map((key, i) => (
            <span key={i} className="inline-block bg-black/30 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-white/15 mx-0.5">
                {key}
            </span>
        ));
    };

    const profiles = [
        { name: 'Job Interview', description: 'Get help with interview questions and responses' },
        { name: 'Sales Call', description: 'Assistance with sales conversations and objection handling' },
        { name: 'Business Meeting', description: 'Support for professional meetings and discussions' },
        { name: 'Presentation', description: 'Help with presentations and public speaking' },
        { name: 'Negotiation', description: 'Guidance for business negotiations and deals' },
        { name: 'Exam Assistant', description: 'Academic assistance for test-taking and exam questions' },
    ];

    return (
        <div className="p-3 space-y-3 overflow-y-auto max-h-full pb-20" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {/* Community & Support */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Community & Support
                </h3>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => onExternalLinkClick('https://cheatingdaddy.com')}
                        className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-blue-400 text-xs font-medium hover:bg-black/30 hover:border-blue-500 transition-all"
                    >
                        🌐 Official Website
                    </button>
                    <button
                        onClick={() => onExternalLinkClick('https://github.com/sohzm/cheating-daddy')}
                        className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-blue-400 text-xs font-medium hover:bg-black/30 hover:border-blue-500 transition-all"
                    >
                        📂 GitHub Repository
                    </button>
                    <button
                        onClick={() => onExternalLinkClick('https://discord.gg/GCBdubnXfJ')}
                        className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-blue-400 text-xs font-medium hover:bg-black/30 hover:border-blue-500 transition-all"
                    >
                        💬 Discord Community
                    </button>
                </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Window Movement */}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-white mb-2">Window Movement</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Move window up</span>
                                <div>{formatKeybind(keybinds.moveUp || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Move window down</span>
                                <div>{formatKeybind(keybinds.moveDown || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Move window left</span>
                                <div>{formatKeybind(keybinds.moveLeft || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Move window right</span>
                                <div>{formatKeybind(keybinds.moveRight || '')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Window Control */}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-white mb-2">Window Control</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Toggle click-through</span>
                                <div>{formatKeybind(keybinds.toggleClickThrough || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Toggle visibility</span>
                                <div>{formatKeybind(keybinds.toggleVisibility || '')}</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Actions */}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-white mb-2">AI Actions</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Ask for next step</span>
                                <div>{formatKeybind(keybinds.nextStep || '')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Response Navigation */}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-white mb-2">Response Navigation</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Previous response</span>
                                <div>{formatKeybind(keybinds.previousResponse || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Next response</span>
                                <div>{formatKeybind(keybinds.nextResponse || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Scroll up</span>
                                <div>{formatKeybind(keybinds.scrollUp || '')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Scroll down</span>
                                <div>{formatKeybind(keybinds.scrollDown || '')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Text Input */}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-white mb-2">Text Input</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">Send message</span>
                                <div>{formatKeybind('Enter')}</div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/70">New line</span>
                                <div>{formatKeybind('Shift+Enter')}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-[11px] text-white/50 italic mt-3">
                    💡 You can customize these shortcuts in the Settings page!
                </p>
            </section>

            {/* How to Use */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    How to Use
                </h3>
                <ol className="space-y-2">
                    {[
                        { title: 'Start a Session:', desc: 'Enter your Gemini API key and click "Start Session"' },
                        { title: 'Customize:', desc: 'Choose your profile and language in the settings' },
                        { title: 'Position Window:', desc: 'Use keyboard shortcuts to move the window' },
                        { title: 'Click-through Mode:', desc: `Use ${keybinds.toggleClickThrough} to make the window click-through` },
                        { title: 'Get AI Help:', desc: 'The AI will analyze your screen and audio' },
                        { title: 'Text Messages:', desc: 'Type questions to the AI using the text input' },
                        { title: 'Navigate Responses:', desc: `Use ${keybinds.previousResponse} and ${keybinds.nextResponse} to browse` },
                    ].map((step, i) => (
                        <li key={i} className="relative pl-7 text-[11px] text-white/70 leading-relaxed">
                            <span className="absolute left-0 top-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                                {i + 1}
                            </span>
                            <strong className="text-white">{step.title}</strong> {step.desc}
                        </li>
                    ))}
                </ol>
            </section>

            {/* Supported Profiles */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Supported Profiles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {profiles.map((profile, i) => (
                        <div key={i} className="bg-black/20 border border-white/10 rounded-lg p-2">
                            <div className="text-xs font-semibold text-white mb-0.5">{profile.name}</div>
                            <div className="text-[10px] text-white/60 leading-tight">{profile.description}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Audio Input */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Audio Input
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                    The AI listens to conversations and provides contextual assistance based on what it hears.
                </p>
            </section>
        </div>
    );
}
