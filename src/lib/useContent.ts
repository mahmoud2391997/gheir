import { useEffect, useState } from "react";

export function useContent<T>(key: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    void (async () => {
      try {
        const response = await fetch(`/api/content/${encodeURIComponent(key)}`);
        if (!response.ok) return;
        const json = await response.json();
        if (cancelled) return;
        if (json?.data !== undefined && json?.data !== null) setData(json.data as T);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load content");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { data, loading, error };
}

