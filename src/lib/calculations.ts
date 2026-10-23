/**
 * Calculation helpers for IPO metrics:
 * - Listing gain percentage and absolute profit
 * - Lot investment calculation
 * - Estimated listing price from GMP
 */

export interface ListingGainResult {
  absoluteGain: number;
  percentageGain: number;
}

/**
 * Calculates listing gain.
 * Formula:
 *   absoluteGain = listingPrice - issuePrice
 *   percentageGain = ((listingPrice - issuePrice) / issuePrice) * 100
 */
export function calculateListingGain(
  issuePrice: number | null | undefined,
  listingPrice: number | null | undefined
): ListingGainResult | null {
  if (
    issuePrice === null ||
    issuePrice === undefined ||
    listingPrice === null ||
    listingPrice === undefined ||
    issuePrice <= 0
  ) {
    return null;
  }

  const absoluteGain = Number((listingPrice - issuePrice).toFixed(2));
  const percentageGain = Number((((listingPrice - issuePrice) / issuePrice) * 100).toFixed(2));

  return {
    absoluteGain,
    percentageGain,
  };
}

/**
 * Calculates minimum retail investment required to bid for 1 lot.
 * Uses price_band_high (cap price) if available, or issue_price.
 */
export function calculateMinInvestment(
  price: number | null | undefined,
  lotSize: number | null | undefined
): number | null {
  if (!price || !lotSize || price <= 0 || lotSize <= 0) {
    return null;
  }
  return Number((price * lotSize).toFixed(2));
}

/**
 * Calculates estimated listing price based on Issue Price + GMP.
 * Always note that GMP is unofficial.
 */
export function calculateEstimatedListing(
  basePrice: number | null | undefined,
  gmpValue: number | null | undefined
): number | null {
  if (basePrice === null || basePrice === undefined || basePrice <= 0) {
    return null;
  }
  if (gmpValue === null || gmpValue === undefined) {
    return null;
  }
  return Number((basePrice + gmpValue).toFixed(2));
}

/**
 * Calculates estimated profit per lot based on GMP.
 */
export function calculateEstimatedLotProfit(
  gmpValue: number | null | undefined,
  lotSize: number | null | undefined
): number | null {
  if (gmpValue === null || gmpValue === undefined || !lotSize || lotSize <= 0) {
    return null;
  }
  return Number((gmpValue * lotSize).toFixed(2));
}
