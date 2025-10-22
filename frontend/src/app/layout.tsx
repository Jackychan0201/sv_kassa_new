import type { Metadata } from "next";
import "./globals.css";
import { Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/molecules/sonner"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "SV Kassa",
  description: "A storage register application for business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="font-sans">{children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}
