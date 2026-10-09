import worker from '../../worker';

interface PagesContext {
  request: Request;
  env: Record<string, any>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return worker.fetch(context.request, context.env as any);
}
