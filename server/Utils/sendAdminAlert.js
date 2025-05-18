import { sendMail } from "./sendMail.js";
const sendAdminAlert = async (accountIds, summaryData) => {
    const emailBody = `
      🚨 Fraud Alert: ${accountIds.length} accounts flagged
      
      ${summaryData.map(d => `
        - Account: ${d._id}
        - Txns: ${d.transactionCount}
        - Max: ₹${d.maxTransaction}
        - Total: ₹${d.totalAmount}
      `).join('\n')}
    `;
  
    await sendMail({
      to: ["dhairyasharma1601@gmail.com"],
      subject: "🚨 Daily Fraud Detection Report",
      text: emailBody,
    });
  };
  
export default sendAdminAlert;