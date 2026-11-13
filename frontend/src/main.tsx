import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const MaybeGoogle = ({ children }: { children: ReactNode }) =>
  googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider> : <>{children}</>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MaybeGoogle>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MaybeGoogle>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
