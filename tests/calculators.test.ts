import { describe, it, expect } from 'vitest';
import {
  computeListingGain,
  computeProfitLoss,
  computeLotQuotaTiers,
} from '../src/lib/calculators';

describe('Engagement Calculators Engine', () => {
  describe('computeListingGain', () => {
    it('computes 1 lot gain correctly', () => {
      // Issue = 500, Expected Debut = 650, Lot = 30, Lots = 1
      const res = computeListingGain({
        issuePrice: 500,
        expectedListingPrice: 650,
        lotSize: 30,
        numberOfLots: 1,
      });

      expect(res).not.toBeNull();
      expect(res?.totalShares).toBe(30);
      expect(res?.totalInvestment).toBe(15000);
      expect(res?.absoluteGainPerShare).toBe(150);
      expect(res?.percentageGain).toBe(30);
      expect(res?.totalGain).toBe(4500);
      expect(res?.totalEstimatedValue).toBe(19500);
    });

    it('computes multiple lots gain correctly', () => {
      // 5 lots of 50 shares = 250 shares
      // Issue = 200, Listing = 250 -> 50/share gain
      const res = computeListingGain({
        issuePrice: 200,
        expectedListingPrice: 250,
        lotSize: 50,
        numberOfLots: 5,
      });

      expect(res?.totalShares).toBe(250);
      expect(res?.totalInvestment).toBe(50000);
      expect(res?.totalGain).toBe(12500);
      expect(res?.percentageGain).toBe(25);
    });

    it('returns null on zero or invalid numbers', () => {
      expect(
        computeListingGain({
          issuePrice: 0,
          expectedListingPrice: 100,
          lotSize: 30,
          numberOfLots: 1,
        })
      ).toBeNull();
    });
  });

  describe('computeProfitLoss with Indian Statutory Charges', () => {
    it('calculates gross and net profit including STT, stamp duty and exchange fees', () => {
      // Buy 100 shares @ 300 = 30,000
      // Sell 100 shares @ 400 = 40,000
      // Gross Profit = 10,000
      const res = computeProfitLoss({
        buyPrice: 300,
        sellPrice: 400,
        shares: 100,
        includeCharges: true,
      });

      expect(res).not.toBeNull();
      expect(res?.grossProfitLoss).toBe(10000);
      expect(res?.totalTurnover).toBe(70000);

      // STT on sell: 40,000 * 0.001 = 40.00
      expect(res?.sttCharge).toBe(40);
      // Stamp duty on buy: 30,000 * 0.00015 = 4.50
      expect(res?.stampDuty).toBe(4.5);

      expect(res?.totalCharges).toBeGreaterThan(44);
      expect(res?.netProfitLoss).toBeLessThan(10000);
      expect(res?.netRoiPercentage).toBeGreaterThan(32);
    });

    it('calculates without charges when toggle is disabled', () => {
      const res = computeProfitLoss({
        buyPrice: 100,
        sellPrice: 120,
        shares: 50,
        includeCharges: false,
      });

      expect(res?.totalCharges).toBe(0);
      expect(res?.netProfitLoss).toBe(1000);
      expect(res?.netRoiPercentage).toBe(20);
    });
  });

  describe('computeLotQuotaTiers', () => {
    it('divides Mainboard IPO into Retail, sHNI and bHNI tiers accurately', () => {
      // Price = 500, Lot = 30 -> Cost per lot = 15,000
      // Max retail lots: floor(200,000 / 15,000) = 13 lots (13 * 15,000 = 1,95,000)
      // Min sHNI lots: 14 lots (14 * 15,000 = 2,10,000)
      // Max sHNI lots: floor(1,000,000 / 15,000) = 66 lots (9,90,000)
      // Min bHNI lots: 67 lots (10,05,000)
      const tiers = computeLotQuotaTiers(500, 30);
      expect(tiers).not.toBeNull();
      expect(tiers?.length).toBe(3);

      const retail = tiers?.find((t) => t.category === 'Retail');
      expect(retail?.minLots).toBe(1);
      expect(retail?.maxLots).toBe(13);
      expect(retail?.minAmount).toBe(15000);
      expect(retail?.maxAmount).toBe(195000);

      const shni = tiers?.find((t) => t.category === 'Small HNI (sHNI)');
      expect(shni?.minLots).toBe(14);
      expect(shni?.maxLots).toBe(66);
      expect(shni?.minAmount).toBe(210000);

      const bhni = tiers?.find((t) => t.category === 'Big HNI (bHNI)');
      expect(bhni?.minLots).toBe(67);
      expect(bhni?.minAmount).toBe(1005000);
    });
  });
});
