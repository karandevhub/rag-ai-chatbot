
import Chat from '../components/Chat';
import SideBarWrapper from '@/components/custom/side-bar-wrapper';

export default async function Page() {


    return (
        <SideBarWrapper>
            <Chat
                selectedModelId={"gpt-3.5-turbo"}
            />
        </SideBarWrapper>
    );
}
