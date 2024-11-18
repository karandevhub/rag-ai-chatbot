import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "../sidebar";
import { AppSidebar } from "./app-sidebar";

export default async function SideBarWrapper({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
    return (
        <SidebarProvider defaultOpen={!isCollapsed}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
