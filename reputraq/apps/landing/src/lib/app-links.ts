const isProduction = process.env.NODE_ENV === "production";

// In local/dev, always target the local web app to avoid accidental redirects to production.
export const appBaseUrl = isProduction
  ? (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.reputraq.com")
  : "http://localhost:3001";

export const appLoginUrl = `${appBaseUrl}/signin`;
export const appSignupUrl = `${appBaseUrl}/signup`;
