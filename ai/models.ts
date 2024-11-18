export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-3.5-turbo',
    label: 'GPT 3.5 Turbo',
    apiIdentifier: 'gpt-3.5-turbo',
    description: 'Highly optimized model for balanced tasks',
  },
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    apiIdentifier: 'gemini-1.5-flash',
    description: 'High-performance model for speed and accuracy',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-3.5-turbo';
