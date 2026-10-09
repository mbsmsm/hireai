import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

function parseGeminiJson<T>(text: string | undefined, fallback: T): T {
  if (!text) return fallback;
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err, '\nRaw text was:', text);
    return fallback;
  }
}

async function generateWithModelPool(ai: GoogleGenAI, params: any): Promise<any> {
  const primaryModel = params.model || 'gemini-3.8-flash';
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Worker Gemini Request] Invoking model "${model}" (attempt ${attempt + 1})...`);
        const result = await ai.models.generateContent({
          ...params,
          model,
        });
        console.log(`[Worker Gemini Success] Generated content using model: "${model}"`);
        return result;
      } catch (err: any) {
        const statusCode = err?.status || err?.statusCode || 500;
        const errMessage = err?.message || String(err);
        const sanitizedMsg = errMessage.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=REDACTED');
        console.error(`[Worker Gemini Error] Model "${model}" | Status: ${statusCode} | ${sanitizedMsg}`);
        lastError = err;

        const isTransient =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('high demand') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTransient) {
          console.warn(`[Worker Failover] Capacity constraint on "${model}". Escalating to fallback...`);
          break;
        }
      }
    }
  }

  throw lastError;
}

function corsHeaders(origin: string = '*'): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Only process /api/* routes; pass everything else to static assets
    if (!url.pathname.startsWith('/api/')) {
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }
      return new Response('Not found', { status: 404 });
    }

    const apiKey = env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY is not configured on Cloudflare.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    try {
      // 1. API: Analyze Resume
      if (url.pathname === '/api/analyze-resume' && request.method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const resumeText = body.resumeText;

        if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
          return new Response(JSON.stringify({ error: 'Please provide valid resume text to analyze.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }

        const prompt = `
You are an expert ATS (Applicant Tracking System) algorithm and senior technical recruiter.
Analyze the following resume objectively. Do NOT invent or fabricate any information not present in the text.
If any section or detail is missing, indicate it accurately.

Return strict JSON matching this structure:
{
  "overallScore": number (0 to 100),
  "atsScore": number (0 to 100),
  "summary": string,
  "technicalSkills": string[],
  "softSkills": string[],
  "education": string[],
  "experience": string[],
  "projects": string[],
  "certifications": string[],
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[],
  "recommendedSkills": string[]
}

Resume Text:
"""
${resumeText.slice(0, 15000)}
"""
`;

        const response = await generateWithModelPool(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.NUMBER },
                atsScore: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: { type: Type.ARRAY, items: { type: Type.STRING } },
                experience: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'overallScore',
                'atsScore',
                'summary',
                'technicalSkills',
                'softSkills',
                'strengths',
                'weaknesses',
                'improvements',
                'recommendedSkills',
              ],
            },
          },
        });

        const parsed = parseGeminiJson<any>(response.text, null);
        if (!parsed) {
          return new Response(JSON.stringify({ error: 'AI returned an unparseable response.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }

        parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore || 70)));
        parsed.atsScore = Math.max(0, Math.min(100, Math.round(parsed.atsScore || 68)));

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      // 2. API: Match Job
      if (url.pathname === '/api/match-job' && request.method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { resumeText, jobDescription, jobTitle } = body;

        if (!resumeText || !jobDescription) {
          return new Response(
            JSON.stringify({ error: 'Both resume text and job description are required for matching.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
          );
        }

        const prompt = `
You are an AI hiring strategist and ATS matching engine.
Evaluate how well the candidate's resume aligns with the specified job posting.
Note: This is an AI-generated match analysis, not an absolute hiring certainty.

Job Title: ${jobTitle || 'Target Position'}
Job Description:
"""
${jobDescription.slice(0, 10000)}
"""

Resume:
"""
${resumeText.slice(0, 15000)}
"""
`;

        const response = await generateWithModelPool(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchScore: { type: Type.NUMBER },
                matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                relevantExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
                jobRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                resumeImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'matchScore',
                'matchingSkills',
                'missingSkills',
                'relevantExperience',
                'jobRequirements',
                'recommendations',
                'resumeImprovements',
              ],
            },
          },
        });

        const result = parseGeminiJson<any>(response.text, null);
        if (!result) {
          return new Response(JSON.stringify({ error: 'Failed to process job match analysis.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }

        result.matchScore = Math.max(0, Math.min(100, Math.round(result.matchScore || 65)));
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      // 3. API: Generate Interview Questions
      if (url.pathname === '/api/generate-interview' && request.method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { resumeText, jobDescription, jobTitle } = body;

        if (!resumeText) {
          return new Response(
            JSON.stringify({ error: 'Resume text is required to generate interview preparation.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
          );
        }

        const prompt = `
You are an expert technical interviewer and executive talent coach.
Generate tailored, high-probability interview questions for this candidate based on their background and target role.

Target Role: ${jobTitle || 'Target Role'}
Job Description:
"""
${(jobDescription || '').slice(0, 8000)}
"""

Candidate Resume:
"""
${resumeText.slice(0, 15000)}
"""
`;

        const response = await generateWithModelPool(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                technicalQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      whyAsked: { type: Type.STRING },
                      suggestedPrep: { type: Type.STRING },
                    },
                    required: ['question', 'whyAsked', 'suggestedPrep'],
                  },
                },
                projectQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      whyAsked: { type: Type.STRING },
                      suggestedPrep: { type: Type.STRING },
                    },
                    required: ['question', 'whyAsked', 'suggestedPrep'],
                  },
                },
                hrQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      whyAsked: { type: Type.STRING },
                      suggestedPrep: { type: Type.STRING },
                    },
                    required: ['question', 'whyAsked', 'suggestedPrep'],
                  },
                },
                behavioralQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      whyAsked: { type: Type.STRING },
                      suggestedPrep: { type: Type.STRING },
                    },
                    required: ['question', 'whyAsked', 'suggestedPrep'],
                  },
                },
              },
              required: ['technicalQuestions', 'projectQuestions', 'hrQuestions', 'behavioralQuestions'],
            },
          },
        });

        const parsed = parseGeminiJson<any>(response.text, null);
        if (!parsed) {
          return new Response(JSON.stringify({ error: 'Failed to generate interview preparation questions.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders(origin) });
    } catch (error: any) {
      console.error('[Worker Catch Error]', error);
      const rawMsg = String(error?.message || error);
      let clientMsg = 'An unexpected error occurred while processing AI request.';

      if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        clientMsg = 'Gemini API rate limit temporarily exceeded. Please wait a moment and try again.';
      } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
        clientMsg = 'Gemini AI service is temporarily experiencing high demand across endpoints. Please retry shortly.';
      }

      return new Response(JSON.stringify({ error: clientMsg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
  },
};
