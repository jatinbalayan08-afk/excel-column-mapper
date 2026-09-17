import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@xyflow/react/dist/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excel Column Mapper",
  description: "Suggest, review, and apply Excel column mappings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}