import { SidebarInset, SidebarProvider } from "../sidebar";
import { AppSidebar } from "./app-sidebar";

export default async function SideBarWrapper({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const isCollapsed = false
    return (
        <SidebarProvider defaultOpen={isCollapsed}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
