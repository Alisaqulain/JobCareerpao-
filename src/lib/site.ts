const DEFAULT_SITE_URL = "https://www.jobcareerpao.in";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, "");
}

export { DEFAULT_SITE_URL };
