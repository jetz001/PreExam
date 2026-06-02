import { type Env } from "./realtime";
import { FirestoreClient, parseServiceAccount } from "./firestore";

// Shared state for polling
export let aiGeneratorState = {
    isRunning: false,
    logs: [] as string[]
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runAIGenerator(prompt: string, env: Env) {
    if (!env.GEMINI_API_KEY) {
        aiGeneratorState.logs.push('[Error] GEMINI_API_KEY is not configured in the environment variables.');
        aiGeneratorState.isRunning = false;
        return;
    }

    aiGeneratorState.isRunning = true;
    aiGeneratorState.logs = ['[System] Initiating AI Generator job...'];
    
    try {
        aiGeneratorState.logs.push('[AI] Connecting to Gemini API (gemini-2.5-flash)...');
        
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

        const requestBody = {
            system_instruction: { parts: { text: systemInstruction } },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                response_mime_type: "application/json",
            }
        };

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Gemini API Error: ${res.status} ${errorText}`);
        }

        const data: any = await res.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
            throw new Error("No text response received from Gemini.");
        }

        aiGeneratorState.logs.push('[System] Received response from Gemini. Parsing JSON...');
        const questions = JSON.parse(textResponse);
        
        if (!Array.isArray(questions)) {
            throw new Error("Gemini did not return a JSON array.");
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
