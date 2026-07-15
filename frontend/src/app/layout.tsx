import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeBeast | Judge Console",
  description: "AI-powered Hackathon Repository Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0E17] text-white flex h-screen overflow-hidden selection:bg-blue-500/30`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto bg-[#0A0E17] p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
