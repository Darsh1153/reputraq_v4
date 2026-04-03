export const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export const appLoginUrl = `${appBaseUrl}/signin`;
export const appSignupUrl = `${appBaseUrl}/signup`;

/** Dodo Payments checkout for Starter plan (INR). */
export const starterPlanCheckoutUrl =
  "https://checkout.dodopayments.com/buy/pdt_0NbsXnd9yQy0SWhz9qiPX?session=sess_jiVUJ6z8EX";

/** Dodo Payments checkout for Growth plan (INR). */
export const growthPlanCheckoutUrl =
  "https://checkout.dodopayments.com/buy/pdt_0NbsXvuDqrM7J3i79ho8b?quantity=1&redirect_url=https://app.reputraq.com%2Fsignup";

/** Dodo Payments checkout for Enterprise plan (INR). */
export const enterprisePlanCheckoutUrl =
  "https://checkout.dodopayments.com/buy/pdt_0NbsY3AB6IajsOSA2FYGr?session=sess_I8eqfdoYdb";
