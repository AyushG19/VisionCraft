"use client";
import {
  DotsPattern,
  TopSection,
  MainContent,
  BottomSection,
  FloatingShapes,
  DecorativeLines,
} from "@workspace/ui/index";
import { loginService, signupService } from "./services/auth.service";
import { useRouter } from "next/navigation";
import { env } from "@/config";

export default function Page() {
  const router = useRouter();
  const navigate = (route: string) => {
    router.push(`/${route}`);
  };
  const handleProviderClick = (provider: "google" | "github") => {
    window.location.href = `${env.HTTP_BACKEND_URL}/api/auth/${provider}`;
  };

  return (
    <div className="relative h-dvh w-dvw bg-easy-bg">
      {/* Decorative dots pattern on the left */}
      <DotsPattern />

      {/* Top section with USERS badge and decorative elements */}
      <TopSection />

      {/* Main content area */}
      <MainContent
        signupService={signupService}
        loginService={loginService}
        navigate={navigate}
        handleProviderClick={handleProviderClick}
      />

      {/* Bottom section with shapes label */}
      <BottomSection />

      {/* Decorative floating shapes */}
      <FloatingShapes />

      {/* Decorative squiggly lines */}
      <DecorativeLines />
    </div>
  );
}
