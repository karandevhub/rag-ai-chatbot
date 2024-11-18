"use client"
import { SidebarInset, SidebarProvider } from "../sidebar";
import { AppSidebar } from "./app-sidebar";

export default  function SideBarWrapper({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
let isCollapsed = true;
    return (
        <SidebarProvider defaultOpen={!isCollapsed}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
