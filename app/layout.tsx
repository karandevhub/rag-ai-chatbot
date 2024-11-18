import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideBarWrapper from "@/components/custom/side-bar-wrapper";

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
        <SideBarWrapper>
          {children}
        </SideBarWrapper>
      </body>
    </html>
  );
}
