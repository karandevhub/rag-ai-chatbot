import { cookies } from 'next/headers';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import Chat from '../components/Chat';

export default async function Page() {
    const cookieStore = await cookies();
    const modelIdFromCookie = cookieStore.get('model-id')?.value;
    const selectedModelId =
        models.find((model) => model.id === modelIdFromCookie)?.id ||
        DEFAULT_MODEL_NAME;

    return (
        <Chat
            selectedModelId={selectedModelId}
        />
    );
}
