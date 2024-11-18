import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG AI",
  description: "A chatbot that answers questions from documents using retrieval-augmented generation (RAG) technology.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={inter.className}>

          {children}

      </body>
    </html>
  );
}
