import { supabase } from './supabase';

type AIResponse = {
  task?: {
    title: string;
    priority: number;
    due_date?: string;
    estimated_time?: number;
  };
  message: string;
};

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `You are a task management AI assistant. Your role is to:
1. Help users create and organize tasks
2. Determine task priority (1-3, where 3 is highest)
3. Estimate time needed (in minutes)
4. Suggest due dates when relevant

Respond with structured data and a helpful message.`;

export async function analyzeTaskInput(input: string): Promise<AIResponse> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Store the interaction in the database
    await supabase.from('ai_interactions').insert([
      {
        input,
        response: data.choices[0].message.content,
        context: { model: 'deepseek-chat' },
      },
    ]);

    return {
      task: {
        title: aiResponse.task.title,
        priority: aiResponse.task.priority,
        due_date: aiResponse.task.due_date,
        estimated_time: aiResponse.task.estimated_time,
      },
      message: aiResponse.message,
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

export async function getTaskSuggestions(tasks: any[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  const tasksContext = JSON.stringify(tasks);
  const prompt = `Based on these tasks: ${tasksContext}, provide suggestions for task prioritization and time management.`;

  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw error;
  }
} 