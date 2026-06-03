import "@/styles/globals.css";

export const metadata = {
  title: "AetherNews | Insights into Future Tech & Engineering",
  description: "A high-fidelity editorial feed focusing on engineering developments, software design trends, and next-generation technology breakthroughs.",
  keywords: ["Software Engineering", "Tech News", "AI Insights", "WebGPU", "Next.js", "Edge Computing"],
  openGraph: {
    title: "AetherNews | Tech & Engineering Journal",
    description: "High-fidelity summaries and editorial insights on the latest tech innovations and software paradigms.",
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
        <div className="relative z-10 min-h-screen flex flex-col max-w-7xl mx-auto px-4 md:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
