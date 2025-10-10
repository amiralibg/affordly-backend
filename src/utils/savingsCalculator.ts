/**
 * Savings Timeline Calculator Utility
 * Calculates how long it takes to save for a product based on user's salary and savings rate
 */

export interface SavingsTimeline {
  monthsToSave: number;
  daysToSave: number;
  estimatedCompletionDate: Date;
  monthlySavingsAmount: number;
  goldToSavePerMonth: number;
}

/**
 * Calculate savings timeline based on product price, user's salary, and savings percentage
 * @param productPrice - Price of the product in Toman
 * @param goldEquivalent - Gold equivalent in grams
 * @param monthlySalary - User's monthly salary in Toman
 * @param savingsPercentage - Percentage of salary to save (0-100)
 * @param currentlySaved - Already saved gold amount in grams (default: 0)
 * @returns SavingsTimeline object with calculation results
 */
export const calculateSavingsTimeline = (
  productPrice: number,
  goldEquivalent: number,
  monthlySalary: number,
  savingsPercentage: number,
  currentlySaved: number = 0
): SavingsTimeline | null => {
  // Validation
  if (monthlySalary <= 0 || savingsPercentage <= 0 || productPrice <= 0) {
    return null;
  }

  // Calculate monthly savings amount in Toman
  const monthlySavingsAmount = (monthlySalary * savingsPercentage) / 100;

  // Calculate remaining amount to save
  const remainingGold = Math.max(0, goldEquivalent - currentlySaved);

  // If already reached goal
  if (remainingGold <= 0) {
    return {
      monthsToSave: 0,
      daysToSave: 0,
      estimatedCompletionDate: new Date(),
      monthlySavingsAmount,
      goldToSavePerMonth: 0,
    };
  }

  // Calculate remaining price to save in Toman
  const remainingPrice = (remainingGold / goldEquivalent) * productPrice;

  // Calculate months needed
  const monthsToSave = remainingPrice / monthlySavingsAmount;
  const daysToSave = Math.ceil(monthsToSave * 30); // Approximate

  // Calculate estimated completion date
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + Math.ceil(monthsToSave));

  // Calculate gold to save per month
  const goldToSavePerMonth = remainingGold / monthsToSave;

  return {
    monthsToSave: parseFloat(monthsToSave.toFixed(2)),
    daysToSave,
    estimatedCompletionDate,
    monthlySavingsAmount,
    goldToSavePerMonth: parseFloat(goldToSavePerMonth.toFixed(4)),
  };
};

/**
 * Calculate required monthly savings to reach goal by a specific date
 * @param productPrice - Price of the product in Toman
 * @param goldEquivalent - Gold equivalent in grams
 * @param targetDate - Target date to complete savings
 * @param currentlySaved - Already saved gold amount in grams
 * @returns Required monthly savings amount in Toman and gold
 */
export const calculateRequiredMonthlySavings = (
  productPrice: number,
  goldEquivalent: number,
  targetDate: Date,
  currentlySaved: number = 0
): { monthlySavingsRequired: number; goldPerMonthRequired: number } | null => {
  const now = new Date();
  const monthsUntilTarget = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsUntilTarget <= 0) {
    return null;
  }

  const remainingGold = Math.max(0, goldEquivalent - currentlySaved);
  const remainingPrice = (remainingGold / goldEquivalent) * productPrice;

  return {
    monthlySavingsRequired: remainingPrice / monthsUntilTarget,
    goldPerMonthRequired: remainingGold / monthsUntilTarget,
  };
};

/**
 * Format timeline for human-readable display
 * @param timeline - SavingsTimeline object
 * @returns Formatted string
 */
export const formatTimeline = (timeline: SavingsTimeline): string => {
  if (timeline.monthsToSave === 0) {
    return 'Goal already reached!';
  }

  const years = Math.floor(timeline.monthsToSave / 12);
  const months = Math.floor(timeline.monthsToSave % 12);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
  }

  if (months > 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  return `${timeline.daysToSave} days`;
};
