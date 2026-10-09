import worker from '../../worker';

interface PagesContext {
  request: Request;
  env: {
    GEMINI_API_KEY?: string;
  };
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return worker.fetch(context.request, context.env);
}
