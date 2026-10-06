// Must be imported before anything that touches Supabase.
import "react-native-url-polyfill/auto";
import * as Crypto from "expo-crypto";

// Hermes has no WebCrypto. Supabase's PKCE flow (used for Google sign-in and email links) needs
// getRandomValues + subtle.digest, otherwise it silently downgrades to the weaker "plain" challenge.
const g = globalThis as unknown as { crypto?: Record<string, unknown> };
if (!g.crypto) g.crypto = {};
if (typeof g.crypto.getRandomValues !== "function") g.crypto.getRandomValues = Crypto.getRandomValues;
if (!g.crypto.subtle) {
  g.crypto.subtle = {
    digest: (algorithm: string, data: BufferSource) => {
      if (algorithm !== "SHA-256") throw new Error(`Unsupported digest: ${algorithm}`);
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
    },
  };
}
