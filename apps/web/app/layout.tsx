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

export const metadata: Metadata = {
  title: { default: "VisionCraft", template: "%S | VisionCraft" },
  description:
    "Realtime AI-powered collaborative drawing and diagramming platform.",
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" suppressHydrationWarning>
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
