import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jhed.dev — Portfolio",
  description: "Portfolio of work: client management, project delivery, and web development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}