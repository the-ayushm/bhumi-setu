import { CompensationCalculationInput, CompensationCalculationResult } from '../types/index.js';
import { STATUTORY_TIMELINES } from '../constants/index.js';

/**
 * Computes statutory Land Acquisition Award in accordance with Section 26 to Section 30
 * of the RFCTLARR Act, 2013.
 * Hardened against negative numbers, NaN, missing/inverted dates, and extreme values.
 */
export function calculateStatutoryAward(
  input: CompensationCalculationInput
): CompensationCalculationResult {
  const {
    baseRatePerAcre,
    areaAcres,
    isRural,
    ruralMultiplier = isRural ? STATUTORY_TIMELINES.DEFAULT_RURAL_MULTIPLIER : 1.0,
    assetsValue = 0,
    section11Date,
    awardDate,
  } = input;

  // Safe non-negative sanitization
  const safeBaseRate = Math.max(0, Number(baseRatePerAcre) || 0);
  const safeArea = Math.max(0, Number(areaAcres) || 0);
  const safeAssets = Math.max(0, Number(assetsValue) || 0);

  // 1. Base Market Value of Land
  const marketValueLand = Math.round(safeBaseRate * safeArea);

  // 2. Rural Multiplier Factor (Section 26(2))
  const multiplier = isRural
    ? Math.min(
        Math.max(Number(ruralMultiplier) || 1.0, STATUTORY_TIMELINES.MIN_RURAL_MULTIPLIER),
        STATUTORY_TIMELINES.MAX_RURAL_MULTIPLIER
      )
    : 1.0;
  const multipliedMarketValue = Math.round(marketValueLand * multiplier);

  // 3. Sub-total before Solatium (Land + Assets/Trees/Structures assessed under Sec 29)
  const subTotalBeforeSolatium = multipliedMarketValue + Math.round(safeAssets);

  // 4. Solatium: 100% on the determined value under Section 30(1)
  const solatiumAmount = Math.round(
    subTotalBeforeSolatium * (STATUTORY_TIMELINES.SOLATIUM_PERCENTAGE / 100)
  );

  // 5. Additional Compensation under Section 30(3): 12% per annum on Market Value (multiplied)
  // from date of publication of Section 11 preliminary notification to date of award
  let daysBetweenSec11AndAward = 0;
  try {
    const s11 = new Date(section11Date);
    const award = new Date(awardDate);
    if (!isNaN(s11.getTime()) && !isNaN(award.getTime()) && award.getTime() >= s11.getTime()) {
      const diffTime = award.getTime() - s11.getTime();
      daysBetweenSec11AndAward = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (e) {
    daysBetweenSec11AndAward = 0;
  }

  const years = daysBetweenSec11AndAward / 365.25;

  const additionalInterestAmount = Math.round(
    multipliedMarketValue * STATUTORY_TIMELINES.ADDITIONAL_COMPENSATION_INTEREST_ANNUAL * years
  );

  // 6. Total Award Amount
  const totalAwardAmount = subTotalBeforeSolatium + solatiumAmount + additionalInterestAmount;

  return {
    marketValueLand: isNaN(marketValueLand) ? 0 : marketValueLand,
    ruralMultiplier: multiplier,
    multipliedMarketValue: isNaN(multipliedMarketValue) ? 0 : multipliedMarketValue,
    assetsValue: isNaN(safeAssets) ? 0 : Math.round(safeAssets),
    subTotalBeforeSolatium: isNaN(subTotalBeforeSolatium) ? 0 : subTotalBeforeSolatium,
    solatiumAmount: isNaN(solatiumAmount) ? 0 : solatiumAmount,
    daysBetweenSec11AndAward: isNaN(daysBetweenSec11AndAward) ? 0 : daysBetweenSec11AndAward,
    additionalInterestAmount: isNaN(additionalInterestAmount) ? 0 : additionalInterestAmount,
    totalAwardAmount: isNaN(totalAwardAmount) ? 0 : totalAwardAmount,
  };
}

/**
 * Formats Indian Currency with INR formatting (Lakhs, Crores)
 * Safe against null, undefined, NaN, and negative amounts.
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (absAmount >= 10000000) {
    formatted = `₹${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    formatted = `₹${(absAmount / 100000).toFixed(2)} Lakh`;
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(absAmount);
  }

  return isNegative ? `-${formatted}` : formatted;
}

