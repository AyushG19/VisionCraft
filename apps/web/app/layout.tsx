import {
  SocketContextProvider,
  ToastContextProvider,
  UserProvider,
} from "@repo/hooks";
import { PingProvider } from "./PingProvider";
import { ThemeProvider } from "./ThemeProvider";
//@ts-ignore
import "./globals.css";
import { Metadata, Viewport } from "next";
import { Krona_One, Handlee } from "next/font/google";

const kronaOne = Krona_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-krona-one", // Maps to Tailwind
});

const handlee = Handlee({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-handlee", // Maps to Tailwind
});

export const metadata: Metadata = {
  title: { default: "Visioncraft", template: "%s | Visioncraft" },
  description:
    "Realtime AI-powered collaborative drawing and diagramming platform.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Visioncraft",
    description:
      "Realtime AI-powered collaborative drawing and diagramming platform.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "system",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${kronaOne.variable},${handlee.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`overflow-hidden overscroll-none touch-none antialiased`}
      >
        <ThemeProvider>
          <ToastContextProvider>
            <UserProvider>
              <PingProvider />
              <SocketContextProvider>{children}</SocketContextProvider>
            </UserProvider>
          </ToastContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
