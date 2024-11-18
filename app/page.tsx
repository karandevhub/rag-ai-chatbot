
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import Chat from '../components/Chat';

export default async function Page() {


    return (
        <Chat
            selectedModelId={"gpt-3.5-turbo"}
        />
    );
}
