// Test script to verify all integrations work before deployment
// Run with: npx tsx scripts/test-integrations.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MailService } from '@sendgrid/mail';
import { GoogleGenAI, Type } from '@google/genai';

const TEST_EMAIL = 'phil@nukode.co.uk'; // Change this to receive test email

async function testSupabase(): Promise<boolean> {
  console.log('\n🔍 Testing Supabase connection...');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  try {
    const supabase = createClient(url, key);

    // Test connection by checking if table exists
    const { data, error } = await supabase
      .from('audit_submissions')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ Table "audit_submissions" does not exist. Please create it first.');
        console.log('   Run the SQL in Supabase SQL Editor to create the table.');
      } else {
        console.error('❌ Supabase error:', error.message);
      }
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log(`   Found ${data?.length || 0} existing submissions`);
    return true;
  } catch (err: any) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
}

async function testSendGrid(): Promise<boolean> {
  console.log('\n🔍 Testing SendGrid connection...');

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey) {
    console.error('❌ Missing SENDGRID_API_KEY');
    return false;
  }

  if (!fromEmail) {
    console.error('❌ Missing SENDGRID_FROM_EMAIL');
    return false;
  }

  try {
    const mailService = new MailService();
    mailService.setApiKey(apiKey);

    // Send a test email - name must match verified sender identity
    const msg = {
      to: TEST_EMAIL,
      from: {
        email: fromEmail,
        name: 'Phil Shields',
      },
      subject: 'Nukode Integration Test - SendGrid Working!',
      text: 'If you receive this email, SendGrid is configured correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #3b82f6;">SendGrid Test Successful!</h2>
          <p>If you receive this email, your SendGrid integration is working correctly.</p>
          <p style="color: #666; font-size: 12px;">Sent from Nukode integration test</p>
        </div>
      `,
    };

    await mailService.send(msg);
    console.log('✅ SendGrid connection successful!');
    console.log(`   Test email sent to: ${TEST_EMAIL}`);
    return true;
  } catch (err: any) {
    console.error('❌ SendGrid error:', err?.response?.body?.errors || err.message);
    if (err?.response?.body?.errors?.[0]?.message?.includes('verified')) {
      console.log('   → You need to verify your sender email in SendGrid');
    }
    return false;
  }
}

async function testGemini(): Promise<boolean> {
  console.log('\n🔍 Testing Gemini AI connection...');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ Missing GEMINI_API_KEY');
    return false;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a senior AI Automation Consultant for "Nukode".
      A test company in E-commerce spends 20 hours/week on manual data entry.
      Propose a brief automation solution.

      Return JSON with: strategy, implementation, savings
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            implementation: { type: Type.STRING },
            savings: { type: Type.STRING },
          },
          required: ['strategy', 'implementation', 'savings'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini');
    }

    const result = JSON.parse(text);
    console.log('✅ Gemini AI connection successful!');
    console.log(`   Strategy: "${result.strategy}"`);
    console.log(`   Savings: "${result.savings}"`);
    return true;
  } catch (err: any) {
    console.error('❌ Gemini error:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Nukode Integration Tests                 ║');
  console.log('╚════════════════════════════════════════════╝');

  const results = {
    supabase: await testSupabase(),
    sendgrid: await testSendGrid(),
    gemini: await testGemini(),
  };

  console.log('\n════════════════════════════════════════════');
  console.log('RESULTS:');
  console.log(`  Supabase: ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  SendGrid: ${results.sendgrid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Gemini:   ${results.gemini ? '✅ PASS' : '❌ FAIL'}`);
  console.log('════════════════════════════════════════════\n');

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('🎉 All tests passed! You can now commit and deploy.\n');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues above before deploying.\n');
  }

  process.exit(allPassed ? 0 : 1);
}

runTests();
