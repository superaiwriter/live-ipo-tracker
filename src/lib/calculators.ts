/**
 * Client-side calculation engine for IPO investor tools:
 * 1. Listing Gain & Expected Debut Return
 * 2. Net Profit/Loss with Indian Statutory & Exchange Charges
 * 3. Lot-Size & Investor Quota Tier Allocation (Retail, sHNI, bHNI)
 */

export interface ListingGainInput {
  issuePrice: number;
  expectedListingPrice: number;
  lotSize: number;
  numberOfLots: number;
}

export interface ListingGainOutput {
  totalShares: number;
  totalInvestment: number;
  absoluteGainPerShare: number;
  percentageGain: number;
  totalGain: number;
  totalEstimatedValue: number;
}

export function computeListingGain(input: ListingGainInput): ListingGainOutput | null {
  const { issuePrice, expectedListingPrice, lotSize, numberOfLots } = input;
  if (issuePrice <= 0 || expectedListingPrice <= 0 || lotSize <= 0 || numberOfLots <= 0) {
    return null;
  }

  const totalShares = lotSize * numberOfLots;
  const totalInvestment = Number((issuePrice * totalShares).toFixed(2));
  const absoluteGainPerShare = Number((expectedListingPrice - issuePrice).toFixed(2));
  const percentageGain = Number((((expectedListingPrice - issuePrice) / issuePrice) * 100).toFixed(2));
  const totalGain = Number((absoluteGainPerShare * totalShares).toFixed(2));
  const totalEstimatedValue = Number((expectedListingPrice * totalShares).toFixed(2));

  return {
    totalShares,
    totalInvestment,
    absoluteGainPerShare,
    percentageGain,
    totalGain,
    totalEstimatedValue,
  };
}

export interface ProfitLossInput {
  buyPrice: number;
  sellPrice: number;
  shares: number;
  includeCharges?: boolean;
}

export interface ProfitLossOutput {
  grossProfitLoss: number;
  totalTurnover: number;
  sttCharge: number;
  exchangeCharges: number;
  gstCharge: number;
  stampDuty: number;
  totalCharges: number;
  netProfitLoss: number;
  netRoiPercentage: number;
}

export function computeProfitLoss(input: ProfitLossInput): ProfitLossOutput | null {
  const { buyPrice, sellPrice, shares, includeCharges = true } = input;
  if (buyPrice <= 0 || sellPrice <= 0 || shares <= 0) {
    return null;
  }

  const buyTurnover = buyPrice * shares;
  const sellTurnover = sellPrice * shares;
  const totalTurnover = buyTurnover + sellTurnover;
  const grossProfitLoss = Number((sellTurnover - buyTurnover).toFixed(2));

  if (!includeCharges) {
    const netRoiPercentage = Number(((grossProfitLoss / buyTurnover) * 100).toFixed(2));
    return {
      grossProfitLoss,
      totalTurnover: Number(totalTurnover.toFixed(2)),
      sttCharge: 0,
      exchangeCharges: 0,
      gstCharge: 0,
      stampDuty: 0,
      totalCharges: 0,
      netProfitLoss: grossProfitLoss,
      netRoiPercentage,
    };
  }

  // Standard Indian Equity Delivery Rates:
  // STT: 0.1% on Sell turnover
  const sttCharge = Number((sellTurnover * 0.001).toFixed(2));
  // Exchange Turnover Fee (NSE approx 0.00345%)
  const exchangeCharges = Number((totalTurnover * 0.0000345).toFixed(2));
  // GST: 18% on exchange charges
  const gstCharge = Number((exchangeCharges * 0.18).toFixed(2));
  // Stamp duty: 0.015% on Buy turnover
  const stampDuty = Number((buyTurnover * 0.00015).toFixed(2));

  const totalCharges = Number((sttCharge + exchangeCharges + gstCharge + stampDuty).toFixed(2));
  const netProfitLoss = Number((grossProfitLoss - totalCharges).toFixed(2));
  const netRoiPercentage = Number(((netProfitLoss / buyTurnover) * 100).toFixed(2));

  return {
    grossProfitLoss,
    totalTurnover: Number(totalTurnover.toFixed(2)),
    sttCharge,
    exchangeCharges,
    gstCharge,
    stampDuty,
    totalCharges,
    netProfitLoss,
    netRoiPercentage,
  };
}

export interface LotQuotaTier {
  category: 'Retail' | 'Small HNI (sHNI)' | 'Big HNI (bHNI)';
  minLots: number;
  maxLots?: number;
  minShares: number;
  maxShares?: number;
  minAmount: number;
  maxAmount?: number;
  description: string;
}

export function computeLotQuotaTiers(price: number, lotSize: number): LotQuotaTier[] | null {
  if (price <= 0 || lotSize <= 0) return null;

  const costPerLot = price * lotSize;

  // Retail: Max amount <= 2,00,000
  const maxRetailLots = Math.max(1, Math.floor(200000 / costPerLot));

  // Small HNI (sHNI): Above ₹2,00,000 up to ₹10,00,000
  const minShniLots = Math.floor(200000 / costPerLot) + 1;
  const maxShniLots = Math.floor(1000000 / costPerLot);

  // Big HNI (bHNI): Above ₹10,00,000
  const minBhniLots = Math.floor(1000000 / costPerLot) + 1;

  const tiers: LotQuotaTier[] = [
    {
      category: 'Retail',
      minLots: 1,
      maxLots: maxRetailLots,
      minShares: lotSize,
      maxShares: maxRetailLots * lotSize,
      minAmount: Number(costPerLot.toFixed(2)),
      maxAmount: Number((maxRetailLots * costPerLot).toFixed(2)),
      description: 'Reserved for individual investors applying up to ₹2 Lakhs.',
    },
  ];

  if (maxShniLots >= minShniLots) {
    tiers.push({
      category: 'Small HNI (sHNI)',
      minLots: minShniLots,
      maxLots: maxShniLots,
      minShares: minShniLots * lotSize,
      maxShares: maxShniLots * lotSize,
      minAmount: Number((minShniLots * costPerLot).toFixed(2)),
      maxAmount: Number((maxShniLots * costPerLot).toFixed(2)),
      description: 'Non-Institutional category for bids between ₹2 Lakhs and ₹10 Lakhs.',
    });
  }

  tiers.push({
    category: 'Big HNI (bHNI)',
    minLots: minBhniLots,
    minShares: minBhniLots * lotSize,
    minAmount: Number((minBhniLots * costPerLot).toFixed(2)),
    description: 'Non-Institutional category for high-value bids exceeding ₹10 Lakhs.',
  });

  return tiers;
}
