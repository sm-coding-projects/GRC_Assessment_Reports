import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import { ToastProvider } from "@/components/ui/toast";
import { CommandPaletteProvider } from "@/components/ui/command-palette";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRC Report Generator",
  description: "Governance, Risk & Compliance report generator for compliance professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <TRPCProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              {children}
            </CommandPaletteProvider>
          </ToastProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
