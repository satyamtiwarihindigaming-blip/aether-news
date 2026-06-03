import "@/styles/globals.css";
import ThreeBg from "@/components/ThreeBg";

export const metadata = {
  title: "AetherNews | Autonomous AI & Tech Feed",
  description: "Experience the future of automated tech news. Dark mode glassmorphic dashboard showcasing real-time automated tech content.",
  keywords: ["AI", "Tech", "Automation", "Web Scraping", "3D Web", "Future Technology"],
  openGraph: {
    title: "AetherNews | Autonomous AI & Tech Feed",
    description: "A gorgeous, autonomous tech and AI news feed updated daily by AI agents.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* 3D Canvas Background */}
        <ThreeBg />

        <div className="relative z-10 min-h-screen flex flex-col max-w-7xl mx-auto px-4 md:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
