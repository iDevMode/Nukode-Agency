import 'dotenv/config';

async function getFormFields() {
  const token = process.env.TYPEFORM_API_TOKEN;
  console.log('Token exists:', !!token);

  const response = await fetch(
    'https://api.typeform.com/forms/BYcoTN6c',
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('Response status:', response.status);

  const data = await response.json();

  if (data.fields) {
    console.log('\nForm fields:');
    console.log('════════════════════════════════════════');
    data.fields.forEach((field: any, i: number) => {
      console.log(`${i+1}. "${field.title}"`);
      console.log(`   ref: "${field.ref}"`);
      console.log(`   type: ${field.type}`);
      console.log('');
    });
  } else {
    console.log('No fields found. Response:', JSON.stringify(data, null, 2));
  }
}

getFormFields().catch(e => console.error('Error:', e));
