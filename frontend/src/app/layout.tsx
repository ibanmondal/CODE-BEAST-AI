import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Anton, Bebas_Neue, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap"
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap"
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap"
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CodeBeast AI — Enterprise Software Intelligence Platform",
  description: "Research-grounded multi-agent repository evaluation, architectural audit, AutoReview security analysis, and ConsJudge consensus scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Antonio:wght@600;700&family=Barlow+Condensed:wght@500;600;700;800&family=Bebas+Neue&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${plexMono.variable} ${anton.variable} ${barlowCondensed.variable} ${bebasNeue.variable} font-sans bg-[#040914] text-white min-h-screen antialiased selection:bg-[#89CFF0]/30 selection:text-[#BAE6FD]`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
