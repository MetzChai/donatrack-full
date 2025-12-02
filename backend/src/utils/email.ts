export const sendEmail = async (to: string, subject: string, message: string) => {
  console.log(`📩 Email sent to ${to}: ${subject} -> ${message}`);
  return true;
};
