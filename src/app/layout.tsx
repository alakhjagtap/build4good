import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emersa — AI Calculus 3 Tutor",
  description:
    "Interactive AI-powered platform that teaches Calculus 3 through synchronized explanation, 3D visuals, and voice interaction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
