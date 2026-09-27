import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const MERCHANT_CODE = process.env.FAWRY_MERCHANT_CODE || '';
const SECURITY_KEY = process.env.FAWRY_SECURITY_KEY || '';
const BASE_URL = process.env.FAWRY_BASE_URL || 'https://atfawry.fawrystaging.com';

export const generateSignature = (params: any): string => {
  // Fawry specific signature concatenation rule
  // merchantCode + merchantRefNum + customerProfileId + itemId + quantity + price + securityKey
  let signatureString = '';
  signatureString += MERCHANT_CODE;
  signatureString += params.merchantRefNum;
  signatureString += params.customerProfileId || '';
  
  if (params.chargeItems && params.chargeItems.length > 0) {
    params.chargeItems.forEach((item: any) => {
      signatureString += item.itemId;
      signatureString += item.quantity;
      signatureString += item.price.toFixed(2);
    });
  }
  
  signatureString += SECURITY_KEY;
  
  return crypto.createHash('sha256').update(signatureString).digest('hex');
};

export const createPaymentRequest = async (
  bookingId: string,
  amount: number,
  customerEmail: string,
  customerPhone: string,
  paymentMethod: string
) => {
  const merchantRefNum = \`REF-\${bookingId}-\${Date.now()}\`;
  
  const payload = {
    merchantCode: MERCHANT_CODE,
    merchantRefNum: merchantRefNum,
    customerMobile: customerPhone,
    customerEmail: customerEmail,
    customerProfileId: customerPhone,
    amount: amount.toFixed(2),
    currencyCode: 'EGP',
    language: 'ar-eg',
    chargeItems: [
      {
        itemId: 'BOOKING',
        description: \`Booking \${bookingId}\`,
        price: amount.toFixed(2),
        quantity: 1
      }
    ],
    paymentMethod: paymentMethod === 'fawry' ? 'PayAtFawry' : 'Card',
    description: \`Payment for booking \${bookingId}\`
  };

  const signature = generateSignature(payload);
  const finalPayload = { ...payload, signature };

  try {
    const response = await axios.post(\`\${BASE_URL}/ECommerceWeb/Fawry/payments/charge\`, finalPayload);
    return {
      success: true,
      data: response.data,
      merchantRefNum
    };
  } catch (error: any) {
    console.error('Fawry payment creation failed', error?.response?.data || error.message);
    throw new Error('Payment initiation failed');
  }
};

export const getPaymentStatus = async (merchantRefNum: string) => {
  const signatureString = MERCHANT_CODE + merchantRefNum + SECURITY_KEY;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

  try {
    const response = await axios.get(\`\${BASE_URL}/ECommerceWeb/Fawry/payments/status/v2\`, {
      params: {
        merchantCode: MERCHANT_CODE,
        merchantRefNumber: merchantRefNum,
        signature
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Fawry payment status check failed', error?.response?.data || error.message);
    throw new Error('Payment status check failed');
  }
};
