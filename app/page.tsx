import { cookies } from 'next/headers';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { generateUUID } from '@/lib/utils';
import Chat from './Chat';
import { SidebarInset, SidebarProvider } from '@/components/sidebar';
import { AppSidebar } from '@/components/custom/app-sidebar';
export const experimental_ppr = true;
export default async function Page() {
    const id = generateUUID();
    const cookieStore = await cookies();
    const modelIdFromCookie = cookieStore.get('model-id')?.value;
    const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

    const selectedModelId =
        models.find((model) => model.id === modelIdFromCookie)?.id ||
        DEFAULT_MODEL_NAME;

    return (
        <SidebarProvider defaultOpen={!isCollapsed}>
            <AppSidebar />
            <SidebarInset> <Chat
                key={id}
                selectedModelId={selectedModelId}
            /></SidebarInset>
        </SidebarProvider>
    );
}
