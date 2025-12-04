import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, X } from 'lucide-react';

interface ConversationTurn {
    transcription?: string;
    ai_response?: string;
    timestamp: string;
}

interface Session {
    id: string;
    timestamp: string;
    conversationHistory: ConversationTurn[];
}

interface SavedResponse {
    response: string;
    timestamp: string;
    profile: string;
}

const profileNames: Record<string, string> = {
    interview: 'Job Interview',
    sales: 'Sales Call',
    meeting: 'Business Meeting',
    presentation: 'Presentation',
    negotiation: 'Negotiation',
    exam: 'Exam Assistant',
};

export function HistoryView() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sessions' | 'saved'>('sessions');
    const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);

    useEffect(() => {
        loadSessions();
        try {
            const saved = JSON.parse(localStorage.getItem('savedResponses') || '[]');
            setSavedResponses(saved);
        } catch {
            setSavedResponses([]);
        }
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const cheddar = (window as any).cheddar;
            if (cheddar?.getAllConversationSessions) {
                const allSessions = await cheddar.getAllConversationSessions();
                setSessions(allSessions);
            }
        } catch (error) {
            console.error('Error loading conversation sessions:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSessionPreview = (session: Session) => {
        if (!session.conversationHistory || session.conversationHistory.length === 0) {
            return 'No conversation yet';
        }
        const firstTurn = session.conversationHistory[0];
        const preview = firstTurn.transcription || firstTurn.ai_response || 'Empty conversation';
        return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
    };

    const deleteSavedResponse = (index: number) => {
        const newResponses = savedResponses.filter((_, i) => i !== index);
        setSavedResponses(newResponses);
        localStorage.setItem('savedResponses', JSON.stringify(newResponses));
    };

    // Conversation View
    if (selectedSession) {
        const messages: { type: 'user' | 'ai'; content: string; timestamp: string }[] = [];
        if (selectedSession.conversationHistory) {
            selectedSession.conversationHistory.forEach(turn => {
                if (turn.transcription) {
                    messages.push({ type: 'user', content: turn.transcription, timestamp: turn.timestamp });
                }
                if (turn.ai_response) {
                    messages.push({ type: 'ai', content: turn.ai_response, timestamp: turn.timestamp });
                }
            });
        }

        return (
            <div className="h-full flex flex-col">
                {/* Back Header */}
                <div className="flex justify-between items-center mb-3">
                    <Button variant="glass" size="sm" onClick={() => setSelectedSession(null)} className="gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Sessions
                    </Button>
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Them
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Suggestion
                        </div>
                    </div>
                </div>

                {/* Conversation View */}
                <div className="flex-1 overflow-y-auto glass-panel rounded-xl p-4 border border-white/20">
                    {messages.length > 0 ? (
                        <div className="space-y-2">
                            {messages.map((message, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "p-3 rounded-r-lg text-sm leading-relaxed border-l-[3px] bg-white/5",
                                        message.type === 'user' ? "border-l-blue-500" : "border-l-red-500"
                                    )}
                                >
                                    {message.content}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-white/50 text-xs mt-8">No conversation data available</div>
                    )}
                </div>
            </div>
        );
    }

    // Sessions List View
    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={cn(
                        "px-4 py-2 text-xs font-medium rounded-t-lg transition-all",
                        activeTab === 'sessions'
                            ? "bg-blue-500/10 text-white border-b-2 border-blue-500"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    Conversation History
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                        "px-4 py-2 text-xs font-medium rounded-t-lg transition-all",
                        activeTab === 'saved'
                            ? "bg-blue-500/10 text-white border-b-2 border-blue-500"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    Saved Responses ({savedResponses.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'sessions' ? (
                    loading ? (
                        <div className="text-center text-white/50 text-xs mt-8">Loading conversation history...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center mt-8">
                            <div className="text-white font-medium mb-1">No conversations yet</div>
                            <div className="text-white/50 text-xs">Start a session to see your conversation history here</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sessions.map((session, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedSession(session)}
                                    className="glass-panel p-3.5 rounded-xl border border-white/20 cursor-pointer hover:bg-white/10 transition-all hover:-translate-y-0.5"
                                >
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="text-xs font-semibold text-white">{formatDate(session.timestamp)}</div>
                                        <div className="text-[11px] text-white/50">{formatTime(session.timestamp)}</div>
                                    </div>
                                    <div className="text-[11px] text-white/60 line-clamp-2">{getSessionPreview(session)}</div>
                                </div>
                            ))}
                        </div>
                    )
                ) : savedResponses.length === 0 ? (
                    <div className="text-center mt-8">
                        <div className="text-white font-medium mb-1">No saved responses</div>
                        <div className="text-white/50 text-xs">Use the save button during conversations to save important responses</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {savedResponses.map((saved, i) => (
                            <div key={i} className="glass-panel p-3.5 rounded-xl border border-white/20">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-[11px] font-semibold text-blue-400">{profileNames[saved.profile] || saved.profile}</div>
                                        <div className="text-[10px] text-white/50">{formatTimestamp(saved.timestamp)}</div>
                                    </div>
                                    <button
                                        onClick={() => deleteSavedResponse(i)}
                                        className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                        title="Delete saved response"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xs text-white/80 leading-relaxed select-text">{saved.response}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
