import { createClient } from '@typeform/api-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const TYPEFORM_FORM_ID = process.env.TYPEFORM_FORM_ID || 'BYcoTN6c';

if (!TYPEFORM_API_TOKEN) {
  console.error('Error: TYPEFORM_API_TOKEN is not set in .env file');
  process.exit(1);
}

const typeformClient = createClient({ token: TYPEFORM_API_TOKEN });

async function testTypeform() {
  try {
    console.log('Fetching current form structure...\n');
    const form = await typeformClient.forms.get({ uid: TYPEFORM_FORM_ID });
    console.log('Current form structure:');
    console.log(JSON.stringify(form, null, 2));
  } catch (error: any) {
    console.error('\n❌ Error:');
    console.error(error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testTypeform();
