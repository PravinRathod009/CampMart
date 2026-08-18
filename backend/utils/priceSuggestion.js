// Depreciation-based price suggestion.
// Age: linear depreciation, 50% value lost per year old, floored at 10% of original.
// Condition: multiplier applied on top of the age-adjusted price.

const CONDITION_MULTIPLIERS = {
  New: 1.0,
  "Like New": 0.9,
  Good: 0.75,
  Fair: 0.6,
  Poor: 0.4,
};

const MIN_AGE_FACTOR = 0.1; // never suggest less than 10% of original price due to age alone
const YEARLY_DEPRECIATION = 0.5; // 50% drop per year old

/**
 * @param {number} originalPrice - what the seller originally paid
 * @param {string|Date} purchaseDate - when the item was purchased (optional)
 * @param {string} condition - one of the CONDITION_MULTIPLIERS keys
 * @returns {{ suggestedPrice: number, ageFactor: number, conditionMultiplier: number, ageInYears: number }}
 */
const suggestPrice = (originalPrice, purchaseDate, condition) => {
  if (!originalPrice || originalPrice <= 0) {
    throw new Error("A valid original price is required");
  }

  let ageInYears = 0;
  if (purchaseDate) {
    const purchased = new Date(purchaseDate);
    const now = new Date();
    ageInYears = Math.max(0, (now - purchased) / (1000 * 60 * 60 * 24 * 365));
  }

  const ageFactor = Math.max(MIN_AGE_FACTOR, 1 - YEARLY_DEPRECIATION * ageInYears);
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] ?? 0.75; // default to "Good" if unknown

  const rawPrice = originalPrice * ageFactor * conditionMultiplier;
  const suggestedPrice = Math.max(1, Math.round(rawPrice));

  return {
    suggestedPrice,
    ageFactor: Number(ageFactor.toFixed(2)),
    conditionMultiplier,
    ageInYears: Number(ageInYears.toFixed(2)),
  };
};

module.exports = { suggestPrice, CONDITION_MULTIPLIERS };
