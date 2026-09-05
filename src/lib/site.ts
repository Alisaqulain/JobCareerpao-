const DEFAULT_SITE_URL = "https://www.jobcareerpao.in";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, "");
}

export function getPaymentCallbackBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      DEFAULT_SITE_URL
    ).replace(/\/$/, "");
  }
  return getSiteUrl();
}

export { DEFAULT_SITE_URL };
