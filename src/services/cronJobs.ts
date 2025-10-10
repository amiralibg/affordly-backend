import * as cron from 'node-cron';
import { storeTodayGoldPrice } from './goldPriceService';

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  // Store gold price daily at 9:00 AM Iran time (UTC+3:30)
  // Cron: "0 9 * * *" in local time
  // We'll run it at 5:30 UTC which is 9:00 AM Iran time
  const dailyGoldPriceJob = cron.schedule(
    '30 5 * * *', // Every day at 05:30 UTC (09:00 Iran time)
    async () => {
      console.log('⏰ Running daily gold price collection...');
      try {
        await storeTodayGoldPrice();
      } catch (error) {
        console.error('❌ Failed to store daily gold price:', error);
      }
    }
  );

  console.log('✅ Cron jobs initialized:');
  console.log('   - Daily gold price collection at 09:00 Iran time');

  return {
    dailyGoldPriceJob,
  };
};

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
export const stopCronJobs = (jobs: { dailyGoldPriceJob: cron.ScheduledTask }) => {
  jobs.dailyGoldPriceJob.stop();
  console.log('⏹️  All cron jobs stopped');
};
