import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const metadata: Metadata = {
  title: "CodeBeast AI | Multi-Agent Repository Intelligence",
  description: "Five specialist AI agents crawl your repository in parallel to evaluate architecture, security, performance, testing, and database structure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${bebas.variable} bg-[#0D0704] text-[#D4BC9A] min-h-screen selection:bg-amber-500/30 relative`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
