import { useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

async function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.accounts?.id) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isEnabled = useMemo(() => Boolean(clientId), [clientId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await apiClient.get<{ client_id: string }>("/auth/google/client-id");
        if (!mounted) return;
        setClientId(data.client_id);
      } catch {
        // If server isn't configured, just hide Google button (MVP-friendly)
        if (!mounted) return;
        setClientId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!clientId) return;
      setError(null);
      try {
        await loadGoogleIdentityScript();
        if (cancelled) return;
        setIsReady(true);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Google Sign-In failed to load");
        setIsReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!isReady || !clientId) return;
    if (!containerRef.current) return;
    if (!window.google?.accounts?.id) return;

    // Clear any previous render
    containerRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          if (isSigningIn) return;
          setIsSigningIn(true);
          setError(null);
          const idToken = response?.credential;
          await loginWithGoogle(idToken);
          onSuccess?.();
        } catch (e: any) {
          setError(e?.message || "Google login failed");
        } finally {
          setIsSigningIn(false);
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
      shape: "pill",
    });
  }, [isReady, clientId, loginWithGoogle, isSigningIn, onSuccess]);

  if (!isEnabled) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {(!isReady || isSigningIn) && (
        <Button type="button" variant="outline" className="w-full" disabled>
          {isSigningIn ? "Signing in with Google…" : "Loading Google Sign-In…"}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}


