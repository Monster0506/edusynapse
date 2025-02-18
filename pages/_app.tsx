"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react"; // Import SessionProvider
import FloatingChatButton from "@/components/FloatingChatButton";
import ChatPopup from "@/components/ChatPopup";
import "../app/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [isChatManagerOpen, setIsChatManagerOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hideChatPaths = ["/login", "/signup", "/"];
    setShowChat(!hideChatPaths.includes(router.pathname));
  }, [router.pathname]);

  useEffect(() => {
    // Apply the user's theme and foreground color preferences
    const userTheme = localStorage.getItem("theme");
    const userForegroundColor = localStorage.getItem("foregroundColor");

    if (userTheme) {
      document.documentElement.classList.toggle("dark", userTheme === "dark");
    }

    if (userForegroundColor) {
      document.documentElement.style.setProperty("--foreground", `var(--${userForegroundColor.toLowerCase()}-500)`);
    }
  }, []);

  const toggleChatManager = () => {
    setIsChatManagerOpen(!isChatManagerOpen);
  };

  return (
    <SessionProvider session={session}> 
      {/* Wraps everything with authentication context */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background text-foreground">
            {/* Now QuickAccessToolbar will get the correct session */}
            <Component {...pageProps} />
            {showChat && (
              <>
                <FloatingChatButton onClick={toggleChatManager} isOpen={isChatManagerOpen} />
                <ChatPopup isOpen={isChatManagerOpen} onClose={() => setIsChatManagerOpen(false)} />
              </>
            )}
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
