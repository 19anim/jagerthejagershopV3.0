const baseApiUrl = (import.meta.env.VITE_BASE_API_URL || "").replace(/\/$/, "");

export const apiUrl = (path) => {
  const normalizedPath =
    baseApiUrl.endsWith("/api") && path.startsWith("/api/")
      ? path.slice(4)
      : path;

  return `${baseApiUrl}${normalizedPath}`;
};
