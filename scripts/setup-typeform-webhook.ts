// Setup Typeform webhook to point to your Vercel deployment
// Run with: npx tsx scripts/setup-typeform-webhook.ts

import 'dotenv/config';

const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const TYPEFORM_FORM_ID = process.env.TYPEFORM_FORM_ID || 'BYcoTN6c';

// Your Vercel deployment URL with custom domain
const WEBHOOK_URL = 'https://www.nukode.co.uk/api/typeform-webhook';

async function checkWebhooks() {
  console.log('🔍 Checking existing webhooks...\n');

  const response = await fetch(
    `https://api.typeform.com/forms/${TYPEFORM_FORM_ID}/webhooks`,
    {
      headers: {
        Authorization: `Bearer ${TYPEFORM_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get webhooks: ${error}`);
  }

  const data = await response.json();
  return data.items || [];
}

async function createWebhook(url: string) {
  console.log(`📝 Creating webhook: ${url}\n`);

  const response = await fetch(
    `https://api.typeform.com/forms/${TYPEFORM_FORM_ID}/webhooks/nukode-webhook`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TYPEFORM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        enabled: true,
        verify_ssl: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create webhook: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Typeform Webhook Setup                   ║');
  console.log('╚════════════════════════════════════════════╝\n');

  if (!TYPEFORM_API_TOKEN) {
    console.error('❌ Missing TYPEFORM_API_TOKEN in .env');
    process.exit(1);
  }

  try {
    // Check existing webhooks
    const webhooks = await checkWebhooks();

    if (webhooks.length > 0) {
      console.log('📋 Existing webhooks:');
      webhooks.forEach((wh: any) => {
        console.log(`   - ${wh.tag}: ${wh.url}`);
        console.log(`     Enabled: ${wh.enabled ? '✅' : '❌'}`);
      });
      console.log('');
    } else {
      console.log('📋 No webhooks configured yet.\n');
    }

    // Create/update webhook
    console.log('🚀 Setting up webhook...');
    const result = await createWebhook(WEBHOOK_URL);

    console.log('\n════════════════════════════════════════════');
    console.log('✅ WEBHOOK CONFIGURED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════\n');
    console.log(`URL: ${result.url}`);
    console.log(`Enabled: ${result.enabled ? 'Yes' : 'No'}`);
    console.log(`Tag: ${result.tag}`);
    console.log('\n🎉 Now when someone fills your form, data will be sent to your webhook!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
