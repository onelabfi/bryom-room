import type { Metadata, Viewport } from "next";
import "./globals.css";
import SensoryBoot from "@/components/room/SensoryBoot";
import PhoneFrame from "@/components/room/PhoneFrame";

export const metadata: Metadata = {
  title: "Bryom Room",
  description:
    "A regulation room for focus, calm, fidget, and release. Built for neurodivergent users.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0f14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="w-full h-full overflow-hidden">
        <SensoryBoot />
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
