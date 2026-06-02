import { type Env } from "./realtime";
import { FirestoreClient, parseServiceAccount } from "./firestore";

// Shared state for polling
export let aiGeneratorState = {
    isRunning: false,
    logs: [] as string[]
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runAIGenerator(prompt: string, env: Env) {
    const providers = [
        { name: "Ollama (Primary)", url: env.OLLAMA_URL, model: env.OLLAMA_MODEL || "gpt-oss:120b", key: env.OLLAMA_API_KEY },
        { name: "Writer (Fallback 1)", url: env.WRITER_BASE_URL, model: env.WRITER_MODEL || "mistral-small-latest", key: env.WRITER_API_KEY },
        { name: "Advisor (Fallback 2)", url: env.ADVISOR_BASE_URL, model: env.ADVISOR_MODEL || "mistral-small-latest", key: env.ADVISOR_API_KEY },
        { name: "QA (Fallback 3)", url: env.QA_BASE_URL, model: env.QA_MODEL || "mistral-small-latest", key: env.QA_API_KEY }
    ].filter(p => p.url && p.key);

    if (providers.length === 0) {
        aiGeneratorState.logs.push('[Error] No LLM providers are configured in the environment variables.');
        aiGeneratorState.isRunning = false;
        return;
    }

    aiGeneratorState.isRunning = true;
    aiGeneratorState.logs = ['[System] Initiating AI Generator job...'];
    
    try {
        const systemInstruction = `You are an expert exam question generator for a Thai examination platform. 
The user will provide a topic or prompt. Generate a JSON array of objects representing exam questions.
Each object MUST exactly match this JSON schema and contain no other fields:
{
  "catalogs": "[\\"CategoryName\\"]",
  "category": "CategoryName",
  "choice_a": "Choice A text",
  "choice_b": "Choice B text",
  "choice_c": "Choice C text",
  "choice_d": "Choice D text",
  "correct_answer": "a", // strictly one of "a", "b", "c", "d" in lowercase
  "difficulty": 50, // integer between 1 and 100
  "exam_set": "Mock Exam",
  "exam_year": "",
  "explanation": "Detailed explanation of why the correct answer is correct (in Thai)",
  "question_image": null,
  "question_text": "The actual question text (in Thai)",
  "rating": 0,
  "ratingCount": 0,
  "skill": "Relevant skill or topic",
  "subject": "Main subject name"
}

Ensure the response is ONLY a valid JSON array, do not wrap it in markdown code blocks like \`\`\`json. Return pure JSON.`;

        let textResponse: string | null = null;
        let lastError: any = null;

        for (const provider of providers) {
            try {
                aiGeneratorState.logs.push(`[AI] Connecting to LLM API via ${provider.name} (${provider.model})...`);
                
                let baseUrl = provider.url!.replace(/\/$/, '');
                if (!baseUrl.endsWith('/v1') && !baseUrl.endsWith('/v1/chat/completions')) {
                    baseUrl += '/v1';
                }
                const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

                const requestBody = {
                    model: provider.model,
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                };

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${provider.key}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status} ${errorText}`);
                }

                const data: any = await res.json();
                const content = data.choices?.[0]?.message?.content;
                
                if (!content) {
                    throw new Error("No text response received from LLM.");
                }

                textResponse = content;
                break; // Success, break the fallback loop
            } catch (err: any) {
                aiGeneratorState.logs.push(`[Warning] Failed with ${provider.name}: ${err.message}. Trying next...`);
                lastError = err;
            }
        }

        if (!textResponse) {
            throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
        }

        aiGeneratorState.logs.push('[System] Received response from LLM. Parsing JSON...');
        
        // Clean up markdown just in case the LLM ignored the instruction
        let cleanedText = textResponse.trim();
        if (cleanedText.startsWith('```json')) cleanedText = cleanedText.substring(7);
        if (cleanedText.startsWith('```')) cleanedText = cleanedText.substring(3);
        if (cleanedText.endsWith('```')) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        cleanedText = cleanedText.trim();
        
        const questions = JSON.parse(cleanedText);
        
        if (!Array.isArray(questions)) {
            throw new Error("LLM did not return a JSON array.");
        }

        aiGeneratorState.logs.push(`[System] Parsed ${questions.length} questions. Saving to Firestore...`);

        const config = parseServiceAccount(env);
        if (!config) throw new Error("Firebase Service Account is not configured in environment.");
        const firestore = new FirestoreClient(config);

        let successCount = 0;
        for (const q of questions) {
            q.id = Math.floor(Math.random() * 1000000000);
            q.createdAt = new Date().toISOString();
            q.updatedAt = q.createdAt;
            
            await firestore.createDocument("questions", q);
            successCount++;
            aiGeneratorState.logs.push(`[Database] Inserted question ${successCount}/${questions.length}: "${q.question_text.substring(0, 30)}..."`);
            await delay(100); 
        }

        aiGeneratorState.logs.push(`[System] Generator job completed successfully. Added ${successCount} questions.`);
    } catch (err: any) {
        aiGeneratorState.logs.push(`[Error] ${err.message}`);
    } finally {
        aiGeneratorState.isRunning = false;
    }
}
