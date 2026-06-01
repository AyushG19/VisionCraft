"use client";
import {
  DotsPattern,
  TopSection,
  BottomSection,
  FloatingShapes,
} from "@repo/ui";
import { loginService, signupService } from "./services/auth.service";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const MainContent = dynamic(
  () => import("@workspace/ui/index").then((mod) => mod.MainContent),
  {
    ssr: false,
  },
);

const DecorativeLines = dynamic(
  () => import("@workspace/ui/index").then((mod) => mod.DecorativeLines),
  { ssr: false },
);
export default function Page() {
  const router = useRouter();
  const navigate = (route: string) => {
    router.push(`/${route}`);
  };
  const handleProviderClick = (provider: "google" | "github") => {
    window.location.href = `/api/auth/${provider}`;
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
