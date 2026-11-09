import { useCallback, useEffect, useState } from "react";
import { authFetch } from "./apiClient";

export function usePlayerProfile() {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { const value = await authFetch("/profile"); setData(value); setError(""); return value; }
    catch (err) { setError(err.message || "Could not load profile."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const changed = event => { if (event.detail?.profile) setData(event.detail); else refresh(); };
    const focused = () => refresh();
    window.addEventListener("xw-profile-changed", changed);
    window.addEventListener("focus", focused);
    return () => { window.removeEventListener("xw-profile-changed", changed); window.removeEventListener("focus", focused); };
  }, [refresh]);
  const mutate = async (path, body, method = "POST") => {
    const value = await authFetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    setData(value); setError("");
    window.dispatchEvent(new CustomEvent("xw-profile-changed", { detail: value }));
    window.dispatchEvent(new Event("xw-accounts-changed"));
    return value;
  };
  return { data, loading, error, refresh, mutate };
}

export async function prepareAvatar(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Choose a JPG, PNG or WebP image. Animated images and SVG are not supported.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image under 5 MB.");
  const image = await createImageBitmap(file);
  try {
    if (image.width > 8192 || image.height > 8192 || image.width * image.height > 40000000) throw new Error("This image is too large. Use a photo smaller than 40 megapixels.");
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 384;
    const context = canvas.getContext("2d"); context.fillStyle = "#171a20"; context.fillRect(0, 0, 384, 384);
    const size = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 384, 384);
    for (const quality of [0.82, 0.72, 0.6]) {
      const result = canvas.toDataURL("image/jpeg", quality);
      if ((result.length - 23) * 3 / 4 <= 96 * 1024) return result;
    }
    throw new Error("Could not compress this image. Please choose another photo.");
  } finally { image.close(); }
}
