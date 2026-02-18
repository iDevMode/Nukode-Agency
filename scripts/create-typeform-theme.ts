import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const TYPEFORM_FORM_ID = process.env.TYPEFORM_FORM_ID || 'BYcoTN6c';

if (!TYPEFORM_API_TOKEN) {
  console.error('Error: TYPEFORM_API_TOKEN is not set in .env file');
  process.exit(1);
}

async function createAndApplyTheme() {
  try {
    console.log('Creating custom Nukode brand theme for Typeform...\n');

    // Nukode brand colors with Playfair Display for elegance
    const theme = {
      name: 'Nukode Dark Theme',
      font: 'Playfair Display',  // Serif font for questions/titles
      has_transparent_button: false, // Solid button so text is readable
      colors: {
        question: '#e5e5e5',        // nukode-text (main questions)
        answer: '#ffffff',           // white (user input)
        button: '#050505',           // dark text on white button background
        background: '#050505',       // nukode-black (main background)
      },
    };

    console.log('Step 1: Creating theme...');
    const createResponse = await fetch('https://api.typeform.com/themes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('\n❌ Error creating theme:');
      console.error('Status:', createResponse.status);
      console.error('Details:', JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    const createdTheme = await createResponse.json();
    console.log('✅ Theme created successfully!');
    console.log('Theme ID:', createdTheme.id);

    // Step 2: Get current form
    console.log('\nStep 2: Getting current form...');
    const getResponse = await fetch(`https://api.typeform.com/forms/${TYPEFORM_FORM_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
      },
    });

    if (!getResponse.ok) {
      console.error('Failed to get current form');
      process.exit(1);
    }

    const currentForm = await getResponse.json();

    // Step 3: Apply theme to the form
    console.log('\nStep 3: Applying theme to form...');
    const updateResponse = await fetch(`https://api.typeform.com/forms/${TYPEFORM_FORM_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentForm,
        theme: {
          href: `https://api.typeform.com/themes/${createdTheme.id}`,
        },
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('\n❌ Error applying theme:');
      console.error('Status:', updateResponse.status);
      console.error('Details:', JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    console.log('✅ Theme applied to form successfully!');
    console.log('\n🎨 Your Typeform now matches your Nukode brand!');
    console.log('Typography: Playfair Display (questions) + Inter fallback');
    console.log('Colors: Dark background (#050505) with light text (#e5e5e5)');
    console.log('Buttons: Solid white with dark text (#050505)');
    console.log(`\nView your branded form at: https://form.typeform.com/to/${TYPEFORM_FORM_ID}`);
    console.log(`Edit your form at: https://admin.typeform.com/form/${TYPEFORM_FORM_ID}/create`);
  } catch (error: any) {
    console.error('\n❌ Error:');
    console.error(error.message);
    console.error(error);
    process.exit(1);
  }
}

createAndApplyTheme();
