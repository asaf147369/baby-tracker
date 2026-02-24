import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth } from "../lib/firebase";
import { Button } from "../components/Button";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate({ to: "/", search: { tab: undefined } });
    });
    return () => unsub();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate({ to: "/", search: { tab: undefined } });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "שגיאה";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[360px] p-6">
      <h1 className="mb-6">התחברות</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block">
            אימייל
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 block">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full p-2"
          />
        </div>
        {error && (
          <p className="mb-4 text-[crimson]">{error}</p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "..." : "כניסה"}
        </Button>
      </form>
    </div>
  );
}
