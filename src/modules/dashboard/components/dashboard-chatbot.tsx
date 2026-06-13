"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X, Bot, Sparkles, Loader2, ArrowRight } from "lucide-react"

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface DashboardChatbotProps {
    dashboardData: unknown;
}

const SUGGESTION_PROMPTS = [
    { label: "Analyze emissions hotspots", prompt: "Can you analyze our current emissions hotspots and tell us which Scope needs the most attention?" },
    { label: "Scope 1 reduction ideas", prompt: "What are some practical Scope 1 direct emissions reduction strategies for a manufacturer?" },
    { label: "Scope 2 energy ideas", prompt: "How can we improve our Scope 2 indirect energy emissions based on our current electricity usage?" },
    { label: "Scope 3 supply chain plan", prompt: "Draft a high-level Scope 3 Category 1 (Purchased Goods) improvement plan for our steel/aluminum suppliers." }
]

export function DashboardChatbot({ dashboardData }: DashboardChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: `Hello! I am **GreenAdvisor**, your ESG carbon accounting assistant. 🌿

I have analyzed your organization's dashboard stats for the current year. I can help you:
- Identify and analyze emissions hotspots
- Draft tailored reduction targets and action steps
- Formulate supply chain improvement initiatives

Click one of the suggestions below or ask me any question about your dashboard data!`
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return

        const userMessage: ChatMessage = { role: 'user', content: text }
        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/dashboard/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    dashboardData
                })
            })

            if (!res.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Sorry, I encountered an error. Please verify your internet connection and try again."
                }])
                setIsLoading(false)
                return
            }

            // Append a placeholder message for the assistant
            setMessages(prev => [...prev, { role: 'assistant', content: "" }])

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })

                    // Update the last message in state dynamically
                    setMessages(prev => {
                        const next = [...prev]
                        if (next.length > 0 && next[next.length - 1].role === 'assistant') {
                            next[next.length - 1].content = next[next.length - 1].content + chunk
                        }
                        return next
                    })
                }
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "An unexpected error occurred. Please try again later."
            }])
            setIsLoading(false)
        }
    }

    const parseMarkdown = (text: string): React.ReactNode[] => {
        return text.split("\n").map((line, lineIndex) => {
            if (line.startsWith("### ")) {
                return <h4 key={lineIndex} className="font-bold text-sm mt-2 mb-1 text-foreground">{line.slice(4)}</h4>
            }
            if (line.startsWith("## ")) {
                return <h3 key={lineIndex} className="font-bold text-base mt-3 mb-1 text-foreground">{line.slice(3)}</h3>
            }
            if (line.startsWith("# ")) {
                return <h2 key={lineIndex} className="font-bold text-lg mt-4 mb-2 text-foreground">{line.slice(2)}</h2>
            }
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                const rawContent = line.trim().slice(2)
                return (
                    <li key={lineIndex} className="ml-4 list-disc text-xs my-1 text-muted-foreground leading-relaxed">
                        {renderBoldText(rawContent)}
                    </li>
                )
            }
            if (line.trim() === "") {
                return <div key={lineIndex} className="h-2" />
            }
            return <p key={lineIndex} className="text-xs my-1 leading-relaxed text-muted-foreground">{renderBoldText(line)}</p>
        })
    }

    const renderBoldText = (text: string): React.ReactNode => {
        const parts = text.split(/\*\*(.*?)\*\*/g)
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index} className="font-bold text-foreground">{part}</strong>
            }
            return part
        })
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-80 sm:w-96 h-[500px] flex flex-col mb-4 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
                    <CardHeader className="bg-primary px-4 py-3 flex flex-row items-center justify-between space-y-0 text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-foreground/10 p-1.5 rounded-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                    GreenAdvisor
                                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                                </CardTitle>
                                <p className="text-[10px] opacity-85">ESG Analytics Assistant</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                        <div className="flex-1 space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-2.5 max-w-[85%] ${
                                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                    }`}
                                >
                                    {msg.role !== 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 border mt-0.5">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-muted/60 text-foreground border border-muted/80 rounded-tl-none'
                                        }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <p className="text-xs leading-relaxed">{msg.content}</p>
                                        ) : (
                                            <div className="space-y-0.5">
                                                {parseMarkdown(msg.content)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 border mt-0.5">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-muted/60 text-foreground border border-muted/80 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {messages.length === 1 && (
                            <div className="space-y-2 pt-2 border-t">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Questions</p>
                                <div className="flex flex-col gap-1.5">
                                    {SUGGESTION_PROMPTS.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(item.prompt)}
                                            className="text-left text-xs bg-muted/40 hover:bg-primary/5 hover:text-primary border border-muted/70 hover:border-primary/20 rounded-xl p-2.5 transition-all flex items-center justify-between group"
                                        >
                                            <span className="font-medium pr-2">{item.label}</span>
                                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage(inputValue)
                        }}
                        className="p-3 border-t bg-muted/30 flex gap-2"
                    >
                        <Input
                            placeholder="Ask GreenAdvisor..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                            className="bg-background h-9 text-xs focus-visible:ring-primary rounded-xl"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="h-9 w-9 rounded-xl shrink-0">
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </form>
                </Card>
            )}

            <div className="relative flex items-center">
                {!isOpen && (
                    <div className="absolute right-14 bg-background border border-emerald-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.08)] px-3 py-1.5 rounded-xl mr-2 whitespace-nowrap pointer-events-none hidden sm:flex items-center gap-1.5 border-l-4 border-l-emerald-500 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            AI Analyst
                        </span>
                    </div>
                )}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-12 w-12 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center p-0 border border-primary/10 ${
                        isOpen 
                            ? 'bg-background hover:bg-muted text-foreground border-border rotate-90' 
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    }`}
                >
                    {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 animate-pulse" />}
                </Button>
            </div>
        </div>
    )
}
