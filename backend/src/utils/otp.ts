import { pool } from '../config/database';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (to: string, body: string) => {
  // Using Twilio API via simple REST call to avoid heavy SDK if preferred, 
  // or just console log for dev if credentials are not present
  if (!TWILIO_SID || !TWILIO_AUTH) {
    console.log(\`[MOCK SMS] To: \${to} | Message: \${body}\`);
    return true;
  }

  try {
    const auth = Buffer.from(\`\${TWILIO_SID}:\${TWILIO_AUTH}\`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_PHONE as string);
    params.append('Body', body);

    await axios.post(
      \`https://api.twilio.com/2010-04-01/Accounts/\${TWILIO_SID}/Messages.json\`,
      params,
      {
        headers: {
          'Authorization': \`Basic \${auth}\`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Twilio SMS sending failed', error);
    return false;
  }
};

export const saveOTP = async (phone: string, code: string, purpose: string = 'login') => {
  // Expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60000);
  await pool.query(
    'INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [phone, code, purpose, expiresAt]
  );
};

export const verifyOTP = async (phone: string, code: string, purpose: string = 'login'): Promise<boolean> => {
  const result = await pool.query(
    'SELECT * FROM otp_codes WHERE phone = $1 AND code = $2 AND purpose = $3 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [phone, code, purpose]
  );

  if (result.rows.length > 0) {
    await pool.query('UPDATE otp_codes SET is_used = true WHERE id = $1', [result.rows[0].id]);
    return true;
  }
  return false;
};
