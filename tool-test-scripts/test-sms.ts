import 'dotenv/config';
import { sendSMS } from '../dist/notify.js';

console.log('Testing SMS tool...');
console.log('API Key set:', !!process.env.TEXTBELT_API_KEY);
console.log('Phone set:', process.env.TEXTBELT_PHONE);

const message = `ADU Pricing - Top Actions:
• Jan 9-10: $100→$175 (Hockey)
• Feb 26-27: $92→$170 (Hockey)
• Apr 4: $158→$280 (Hash Bash)
• Apr 28: $241→$550 (Graduation)
Total: +$2,325`;

console.log('\nSending message:', message);

const result = await sendSMS._callback({ message });
console.log('\nResult:', JSON.stringify(result, null, 2));
