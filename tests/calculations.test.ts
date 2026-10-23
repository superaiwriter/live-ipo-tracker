import { describe, it, expect } from 'vitest';
import {
  calculateListingGain,
  calculateMinInvestment,
  calculateEstimatedListing,
  calculateEstimatedLotProfit,
} from '../src/lib/calculations';

describe('Financial and IPO Calculations', () => {
  describe('calculateListingGain', () => {
    it('calculates positive listing gain correctly', () => {
      // Issue price = 100, Listing price = 150 -> Gain = 50 (50.00%)
      const result = calculateListingGain(100, 150);
      expect(result).not.toBeNull();
      expect(result?.absoluteGain).toBe(50);
      expect(result?.percentageGain).toBe(50);
    });

    it('calculates negative listing gain (listing loss) correctly', () => {
      // Issue price = 200, Listing price = 180 -> Gain = -20 (-10.00%)
      const result = calculateListingGain(200, 180);
      expect(result).not.toBeNull();
      expect(result?.absoluteGain).toBe(-20);
      expect(result?.percentageGain).toBe(-10);
    });

    it('handles decimal precision properly', () => {
      // Issue price = 125, Listing price = 138.50 -> Gain = 13.50 (10.80%)
      const result = calculateListingGain(125, 138.5);
      expect(result).not.toBeNull();
      expect(result?.absoluteGain).toBe(13.5);
      expect(result?.percentageGain).toBe(10.8);
    });

    it('returns null for missing, null, or zero issue price', () => {
      expect(calculateListingGain(null, 150)).toBeNull();
      expect(calculateListingGain(100, null)).toBeNull();
      expect(calculateListingGain(0, 150)).toBeNull();
      expect(calculateListingGain(-50, 150)).toBeNull();
    });
  });

  describe('calculateMinInvestment', () => {
    it('calculates 1 lot investment amount', () => {
      // 500 per share * 30 shares per lot = 15,000
      expect(calculateMinInvestment(500, 30)).toBe(15000);
      // SME IPO: 120 per share * 1000 shares per lot = 120,000
      expect(calculateMinInvestment(120, 1000)).toBe(120000);
    });

    it('returns null for invalid or missing inputs', () => {
      expect(calculateMinInvestment(null, 30)).toBeNull();
      expect(calculateMinInvestment(500, null)).toBeNull();
      expect(calculateMinInvestment(0, 30)).toBeNull();
      expect(calculateMinInvestment(500, 0)).toBeNull();
    });
  });

  describe('calculateEstimatedListing and Lot Profit from GMP', () => {
    it('calculates estimated listing price', () => {
      // Base price = 85, GMP = 25 -> Estimated = 110
      expect(calculateEstimatedListing(85, 25)).toBe(110);
    });

    it('handles negative GMP discount', () => {
      // Base price = 100, GMP = -5 -> Estimated = 95
      expect(calculateEstimatedListing(100, -5)).toBe(95);
    });

    it('calculates lot profit based on GMP', () => {
      // GMP = 20, Lot size = 150 -> 3000 profit
      expect(calculateEstimatedLotProfit(20, 150)).toBe(3000);
    });

    it('returns null when GMP is missing', () => {
      expect(calculateEstimatedListing(85, null)).toBeNull();
      expect(calculateEstimatedLotProfit(null, 150)).toBeNull();
    });
  });
});
