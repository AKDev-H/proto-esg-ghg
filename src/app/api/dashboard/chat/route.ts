import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface DashboardDataShape {
    organization?: {
        name?: string;
        country?: string;
    };
    totalTonCO2e?: number;
    byScope?: {
        scope1?: number;
        scope2?: number;
        scope3?: number;
    };
    metrics?: {
        renewable?: { value?: number };
        energy?: { value?: number; unit?: string };
        intensity?: { value?: number; unit?: string };
        waste?: { value?: number; unit?: string };
    };
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { messages, dashboardData } = body as { messages: ChatMessage[], dashboardData: DashboardDataShape }

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"

        if (!apiKey) {
            return NextResponse.json({
                role: 'assistant',
                content: "AI Assistant is currently offline. Please configure `GEMINI_API_KEY` in your environment variables to enable this chat feature."
            })
        }

        // Build system instruction
        const systemInstructionText = `You are "GreenAdvisor", a helpful and expert AI ESG analyst for manufacturing organizations.
You have access to the user's current ESG and carbon accounting dashboard data:
- Organization: ${dashboardData?.organization?.name ?? 'Unknown'} (Country: ${dashboardData?.organization?.country ?? 'US'})
- Total Emissions: ${dashboardData?.totalTonCO2e ?? 0} tCO2e
- Scope 1 Emissions: ${dashboardData?.byScope?.scope1 ?? 0} tCO2e
- Scope 2 Emissions: ${dashboardData?.byScope?.scope2 ?? 0} tCO2e
- Scope 3 Emissions: ${dashboardData?.byScope?.scope3 ?? 0} tCO2e
- Renewable Energy Share: ${dashboardData?.metrics?.renewable?.value ?? 0}%
- Energy Consumption: ${dashboardData?.metrics?.energy?.value ?? 0} ${dashboardData?.metrics?.energy?.unit ?? 'kWh'}
- Intensity: ${dashboardData?.metrics?.intensity?.value ?? 0} ${dashboardData?.metrics?.intensity?.unit ?? 'kgCO2e/unit'}
- Waste Generated: ${dashboardData?.metrics?.waste?.value ?? 0} ${dashboardData?.metrics?.waste?.unit ?? 'kg'}

Focus on analyzing these numbers, identifying emissions hotspots, explaining ESG metrics, and providing realistic action plans or suggestions to improve sustainability.
Keep your answers professional, concise, structured (using bullet points and bold text where appropriate), and tailored to manufacturing. If the organization is in Malaysia, refer to Malaysia-specific context (e.g. Peninsular Malaysia grid, Bursa Malaysia ESG guidelines). If in the US, refer to US EPA factors/policies.
Do not ask the user for data that you already have in the dashboard context. Just answer based on the provided stats.`

        // Filter out the initial greeting if it is the first message
        // The first message in Gemini must be from the 'user' role.
        const userMessageIndex = messages.findIndex(m => m.role === 'user')
        const activeMessages = userMessageIndex !== -1 ? messages.slice(userMessageIndex) : messages

        // Map active messages to Gemini contents format
        const contents = activeMessages.map((m: ChatMessage) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }))

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemInstructionText }]
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    },
                }),
            }
        )

        if (!response.ok) {
            console.error("Gemini API call failed with status:", response.status)
            return NextResponse.json({
                role: 'assistant',
                content: "I'm having trouble connecting to my brain right now. Please try again in a moment."
            })
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        const stream = new ReadableStream({
            async start(controller) {
                if (!response.body) {
                    controller.close()
                    return
                }

                const reader = response.body.getReader()
                let buffer = ""

                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        buffer += decoder.decode(value, { stream: true })
                        const lines = buffer.split("\n")
                        buffer = lines.pop() || ""

                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const dataStr = line.slice(6).trim()
                                if (dataStr === "[DONE]") continue
                                try {
                                    const json = JSON.parse(dataStr)
                                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                                    if (text) {
                                        controller.enqueue(encoder.encode(text))
                                    }
                                } catch {
                                    // Ignore JSON parse errors on partial lines
                                }
                            }
                        }
                    }

                    // Process remaining buffer
                    if (buffer.startsWith("data: ")) {
                        const dataStr = buffer.slice(6).trim()
                        try {
                            const json = JSON.parse(dataStr)
                            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                            if (text) {
                                controller.enqueue(encoder.encode(text))
                            }
                        } catch {}
                    }
                } catch (error) {
                    controller.error(error)
                } finally {
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        })

    } catch (error) {
        console.error("Error in dashboard chat API:", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
