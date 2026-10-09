import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI initialization
// Strictly server-side: GEMINI_API_KEY is never exposed to browser
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to safely parse JSON response from Gemini
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

// Official candidate models in priority order from the @google/genai guidelines
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

// Resilient wrapper with multi-model failover and detailed logging
async function generateWithRetry(params: any): Promise<any> {
  const primaryModel = params.model || 'gemini-3.8-flash';
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini Request] Invoking model "${model}" (attempt ${attempt + 1})...`);
        const result = await ai.models.generateContent({
          ...params,
          model,
        });
        console.log(`[Gemini Success] Content successfully generated using model: "${model}"`);
        return result;
      } catch (err: any) {
        const statusCode =
          err?.status ||
          err?.statusCode ||
          (err?.message?.includes('503') ? 503 : err?.message?.includes('429') ? 429 : 500);
        const errMessage = err?.message || String(err);

        // Sanitize log to ensure API key is never exposed
        const sanitizedMsg = errMessage.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=REDACTED');
        console.error(
          `[Gemini Server Log] Model: "${model}" | Attempt: ${attempt + 1} | HTTP Status: ${statusCode} | Error: ${sanitizedMsg}`
        );

        lastError = err;

        const isTransient =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('high demand') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTransient) {
          console.warn(
            `[Gemini Auto-Failover] Capacity constraint on "${model}" (HTTP ${statusCode}). Trying next model in pool...`
          );
          break; // Immediately move to next candidate model in the chain
        }
      }
    }
  }

  throw lastError;
}

function formatFriendlyError(error: any): string {
  const rawMsg = String(error?.message || error);
  if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('401') || rawMsg.includes('403')) {
    return 'Gemini API authentication failed. Please verify that the GEMINI_API_KEY is active and valid.';
  }
  if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Gemini API rate limit temporarily exceeded. Please wait a moment and try again.';
  }
  if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
    return 'Gemini AI service is temporarily experiencing high demand across endpoints. Please retry shortly.';
  }
  return error?.message || 'An unexpected error occurred while processing AI request.';
}

// 1. API: Analyze Resume
app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text to analyze.' });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) algorithm and senior technical recruiter.
Analyze the following resume objectively. Do NOT invent or fabricate any information not present in the text.
If any section or detail is missing, indicate it accurately.

Return strict JSON matching this structure:
{
  "overallScore": number (0 to 100, comprehensive quality, clarity, and impact score),
  "atsScore": number (0 to 100, ATS format compliance, keyword density, section headers, readability),
  "summary": string (Concise 2-3 sentence executive summary of the candidate's professional profile),
  "technicalSkills": string[] (Extracted technical skills, tools, languages, frameworks found in the text),
  "softSkills": string[] (Extracted interpersonal, leadership, and collaboration skills found),
  "education": string[] (Degrees, institutions, graduation dates, or academic honors listed),
  "experience": string[] (Key professional roles or internships with company and highlights),
  "projects": string[] (Projects, portfolios, or notable achievements found),
  "certifications": string[] (Certifications or licenses found, or empty list if none),
  "strengths": string[] (3-5 concrete strengths of this resume),
  "weaknesses": string[] (3-5 critical areas lacking detail, metrics, or clarity),
  "improvements": string[] (4-6 actionable, high-impact improvements to boost ATS score and interview callbacks),
  "recommendedSkills": string[] (4-6 modern in-demand industry skills that would complement this candidate's background)
}

Resume Text:
"""
${resumeText.slice(0, 15000)}
"""
`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
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
      return res.status(500).json({ error: 'AI returned an unparseable response. Please try again.' });
    }

    // Ensure scores are bounded properly
    parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore || 70)));
    parsed.atsScore = Math.max(0, Math.min(100, Math.round(parsed.atsScore || 68)));

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-resume:', error);
    res.status(500).json({
      error: formatFriendlyError(error),
    });
  }
});

// 2. API: Match Job
app.post('/api/match-job', async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resume text and job description are required for matching.' });
    }

    const prompt = `
You are an AI hiring strategist and ATS matching engine.
Evaluate how well the candidate's resume aligns with the specified job posting.
Note: This is an AI-generated match analysis, not an absolute hiring certainty.

Analyze:
1. matchScore: Percentage from 0 to 100 reflecting qualification and keyword match.
2. matchingSkills: Skills in the job description that the candidate demonstrably possesses.
3. missingSkills: High-priority skills or tools requested by the job description that are NOT found on the resume.
4. relevantExperience: Specific experiences or projects on the resume that directly support this role.
5. jobRequirements: Core qualifications and expectations summarized from the job posting.
6. recommendations: Practical advice for how the candidate can bridge gaps before applying.
7. resumeImprovements: Specific bullet points or keywords the candidate should tailor on their resume for this posting.

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

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
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
      return res.status(500).json({ error: 'Failed to process job match analysis.' });
    }

    result.matchScore = Math.max(0, Math.min(100, Math.round(result.matchScore || 65)));
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/match-job:', error);
    res.status(500).json({
      error: formatFriendlyError(error),
    });
  }
});

// 3. API: Generate Interview Questions
app.post('/api/generate-interview', async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required to generate interview preparation.' });
    }

    const prompt = `
You are an expert technical interviewer and executive talent coach.
Generate tailored, high-probability interview questions for this candidate based on their background and target role.
For each question, provide:
- question: The realistic interview question
- whyAsked: Why the hiring manager or recruiter asks this (intent / evaluation criteria)
- suggestedPrep: Practical talking points, STAR method cues, or key concepts the candidate should prepare

Generate 3-4 questions for each category:
1. Technical Questions (Deep-dive into tools, architecture, languages mentioned)
2. Project Questions (Probing specific projects, metrics, architectural decisions, and challenges)
3. HR Questions (Culture fit, salary expectation handling, career trajectory, motivation)
4. Behavioral Questions (Conflict resolution, deadline pressure, teamwork, leadership)

Target Role: ${jobTitle || 'Target Role'}
Job Description Context (if provided):
"""
${(jobDescription || 'Standard industry requirements for candidate background').slice(0, 8000)}
"""

Candidate Resume:
"""
${resumeText.slice(0, 15000)}
"""
`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
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
      return res.status(500).json({ error: 'Failed to generate interview preparation questions.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-interview:', error);
    res.status(500).json({
      error: formatFriendlyError(error),
    });
  }
});

// Vite middleware integration (Dev) or Static serving (Prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HireAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
