import { cookies } from 'next/headers';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { generateUUID } from '@/lib/utils';
import Chat from '../components/Chat';

export default async function Page() {
    const id = generateUUID();
    const cookieStore = await cookies();
    const modelIdFromCookie = cookieStore.get('model-id')?.value;
    const selectedModelId =
        models.find((model) => model.id === modelIdFromCookie)?.id ||
        DEFAULT_MODEL_NAME;

    return (
        <Chat
            key={id}
            selectedModelId={selectedModelId}
        />
    );
}
