import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "TOURCAST Shot Lab", description: "PGA TOUR shot explorer and data exports" };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
