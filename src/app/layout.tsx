import type { Metadata } from "next";
import { Bitter, Public_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bitter",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Enquiry Portal",
  description: "Browse the catalogue and send an enquiry to a seller.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bitter.variable} ${publicSans.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}