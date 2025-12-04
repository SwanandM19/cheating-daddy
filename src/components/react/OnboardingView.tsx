import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingViewProps {
    onComplete: (apiKey: string) => void;
    initialApiKey?: string;
}

// Color schemes for each slide
const colorSchemes = [
    // Welcome (dark purple-gray)
    [
        [25, 25, 35],
        [20, 20, 30],
        [30, 25, 40],
        [15, 15, 25],
        [35, 30, 45],
        [10, 10, 20],
    ],
    // Privacy (dark blue-gray)
    [
        [20, 25, 35],
        [15, 20, 30],
        [25, 30, 40],
        [10, 15, 25],
        [30, 35, 45],
        [5, 10, 20],
    ],
    // Context (dark neutral)
    [
        [25, 25, 25],
        [20, 20, 20],
        [30, 30, 30],
        [15, 15, 15],
        [35, 35, 35],
        [10, 10, 10],
    ],
    // Features (dark green-gray)
    [
        [20, 30, 25],
        [15, 25, 20],
        [25, 35, 30],
        [10, 20, 15],
        [30, 40, 35],
        [5, 15, 10],
    ],
    // Complete (dark warm gray)
    [
        [30, 25, 20],
        [25, 20, 15],
        [35, 30, 25],
        [20, 15, 10],
        [40, 35, 30],
        [15, 10, 5],
    ],
];

const slides = [
    {
        icon: 'assets/onboarding/welcome.svg',
        title: 'Welcome to Cheating Daddy',
        content: 'Your AI assistant that listens and watches, then provides intelligent suggestions automatically during interviews and meetings.',
    },
    {
        icon: 'assets/onboarding/security.svg',
        title: 'Completely Private',
        content: 'Invisible to screen sharing apps and recording software. Your secret advantage stays completely hidden from others.',
    },
    {
        icon: 'assets/onboarding/context.svg',
        title: 'Add Your Context',
        content: 'Share relevant information to help the AI provide better, more personalized assistance.',
        showTextarea: true,
    },
    {
        icon: 'assets/onboarding/customize.svg',
        title: 'Additional Features',
        content: '',
        showFeatures: true,
    },
    {
        icon: 'assets/onboarding/ready.svg',
        title: 'Ready to Go',
        content: 'Add your Gemini API key in settings and start getting AI-powered assistance in real-time.',
    },
];

export function OnboardingView({ onComplete, initialApiKey = '' }: OnboardingViewProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [contextText, setContextText] = useState('');
    const [apiKey, setApiKey] = useState(initialApiKey);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const transitionRef = useRef({
        isTransitioning: false,
        startTime: 0,
        previousScheme: null as number[][] | null,
    });

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const interpolateColors = (scheme1: number[][], scheme2: number[][], progress: number) => {
        return scheme1.map((color1, index) => {
            const color2 = scheme2[index];
            return [
                color1[0] + (color2[0] - color1[0]) * progress,
                color1[1] + (color2[1] - color1[1]) * progress,
                color1[2] + (color2[2] - color1[2]) * progress,
            ];
        });
    };

    const drawGradient = useCallback(
        (timestamp: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const { width, height } = canvas;
            let colors = colorSchemes[currentSlide];

            // Handle transitions
            const transition = transitionRef.current;
            if (transition.isTransitioning && transition.previousScheme) {
                const elapsed = timestamp - transition.startTime;
                const progress = Math.min(elapsed / 800, 1);
                const easedProgress = easeInOutCubic(progress);
                colors = interpolateColors(transition.previousScheme, colorSchemes[currentSlide], easedProgress);

                if (progress >= 1) {
                    transition.isTransitioning = false;
                    transition.previousScheme = null;
                }
            }

            const time = timestamp * 0.0005;
            const flowX = Math.sin(time * 0.7) * width * 0.3;
            const flowY = Math.cos(time * 0.5) * height * 0.2;

            const gradient = ctx.createLinearGradient(flowX, flowY, width + flowX * 0.5, height + flowY * 0.5);

            colors.forEach((color, index) => {
                const offset = index / (colors.length - 1);
                const wave = Math.sin(time + index * 0.3) * 0.05;
                const r = Math.max(0, Math.min(255, color[0] + wave * 5));
                const g = Math.max(0, Math.min(255, color[1] + wave * 5));
                const b = Math.max(0, Math.min(255, color[2] + wave * 5));
                gradient.addColorStop(offset, `rgb(${r}, ${g}, ${b})`);
            });

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Radial overlay
            const centerX = width * 0.5 + Math.sin(time * 0.3) * width * 0.15;
            const centerY = height * 0.5 + Math.cos(time * 0.4) * height * 0.1;
            const radius = Math.max(width, height) * 0.8;

            const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            radialGradient.addColorStop(0, `rgba(${colors[0][0] + 10}, ${colors[0][1] + 10}, ${colors[0][2] + 10}, 0.1)`);
            radialGradient.addColorStop(0.5, `rgba(${colors[2][0]}, ${colors[2][1]}, ${colors[2][2]}, 0.05)`);
            radialGradient.addColorStop(1, `rgba(${colors[5][0]}, ${colors[5][1]}, ${colors[5][2]}, 0.03)`);

            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = radialGradient;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';

            animationRef.current = requestAnimationFrame(drawGradient);
        },
        [currentSlide]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        animationRef.current = requestAnimationFrame(drawGradient);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [drawGradient]);

    const goToSlide = (newSlide: number) => {
        transitionRef.current = {
            isTransitioning: true,
            startTime: performance.now(),
            previousScheme: [...colorSchemes[currentSlide]],
        };
        setCurrentSlide(newSlide);
    };

    const nextSlide = () => {
        if (currentSlide < 4) {
            goToSlide(currentSlide + 1);
        } else {
            completeOnboarding();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    };

    const completeOnboarding = () => {
        if (contextText.trim()) {
            localStorage.setItem('customPrompt', contextText.trim());
        }
        localStorage.setItem('onboardingCompleted', 'true');
        // Notify main process
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.invoke('set-onboarded');
        }
        onComplete(apiKey);
    };

    const slide = slides[currentSlide];

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden select-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            <div className="absolute inset-0 bottom-[60px] flex flex-col justify-center p-8 max-w-[500px] text-gray-200 z-10">
                <img src={slide.icon} alt={slide.title} className="w-12 h-12 mb-4 opacity-90" />
                <h1 className="text-[28px] font-semibold mb-3 text-white leading-tight">{slide.title}</h1>
                <p className="text-base leading-relaxed mb-6 text-gray-400 font-normal">{slide.content}</p>

                {slide.showTextarea && (
                    <Textarea
                        placeholder="Paste your resume, job description, or any relevant context here..."
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        className="mb-6 h-[100px] resize-y glass"
                    />
                )}

                {slide.showFeatures && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[15px] text-gray-400">
                            <span className="text-base opacity-80">🎨</span>
                            Customize AI behavior and responses
                        </div>
                        <div className="flex items-center gap-3 text-[15px] text-gray-400">
                            <span className="text-base opacity-80">📚</span>
                            Review conversation history
                        </div>
                        <div className="flex items-center gap-3 text-[15px] text-gray-400">
                            <span className="text-base opacity-80">🔧</span>
                            Adjust capture settings and intervals
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-blue-900/30 backdrop-blur-md border-t border-blue-500/20 h-[60px]" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <Button
                    variant="glass"
                    size="icon"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="h-10 w-10 disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-3 items-center">
                    {[0, 1, 2, 3, 4].map((index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                index === currentSlide ? 'bg-white/80 scale-125' : 'bg-white/20 hover:bg-white/40'
                            }`}
                        />
                    ))}
                </div>

                <Button variant="glass" onClick={nextSlide} className="min-w-[100px]">
                    {currentSlide === 4 ? 'Get Started' : <ChevronRight className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
