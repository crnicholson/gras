import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gras - touch grass at home",
  description: "touch grass at the comfort of your home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
