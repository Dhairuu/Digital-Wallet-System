import cron from 'node-cron';
import runFraudScan from '../Utils/runFraudScan.js';

cron.schedule('0 0 * * *', async () => {
  console.log("Running daily fraud scan...");
  await runFraudScan();
});