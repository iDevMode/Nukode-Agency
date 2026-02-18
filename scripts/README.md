# Typeform Integration - ROI Audit Form

This directory contains scripts and types for managing your Typeform AI Automation Audit form programmatically.

## Quick Start

### 1. Get Your Typeform API Token

1. Go to https://admin.typeform.com/account#/section/tokens
2. Click "Generate a new token"
3. Give it a name (e.g., "Nukode ROI Form")
4. Select the following scopes:
   - `forms:read`
   - `forms:write`
5. Copy the token

### 2. Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Typeform API token to `.env`:
   ```
   TYPEFORM_API_TOKEN=tfp_your_actual_token_here
   TYPEFORM_FORM_ID=BYcoTN6c
   ```

### 3. Update Your Typeform

Run the setup script to add all 17 questions AND apply your Nukode brand theme:

```bash
npm run typeform:setup
```

Or run them separately:

```bash
# Update questions only
npm run typeform:update

# Apply brand theme only
npm run typeform:theme
```

This will update your existing form at `https://form.typeform.com/to/BYcoTN6c` with:

## The 17 Essential Questions

### Business Fundamentals
1. **Company Name** (text, required)
2. **Industry** (dropdown, required)
3. **Company Size** (dropdown, required)
4. **Annual Revenue** (dropdown, required)

### Critical for ROI Calculation
5. **Primary Business Challenges** (multiple choice, required)
6. **Time-Consuming Processes** (multiple choice, required)
7. **Hours/Week on Manual Tasks** (number, required) ⚠️ ESSENTIAL
8. **Employees on Repetitive Tasks** (number, required) ⚠️ ESSENTIAL
9. **Hourly Cost per Employee** (dropdown, required) ⚠️ ESSENTIAL

### Context & Goals
10. **Monthly Operating Costs** (dropdown, optional)
11. **Current Tech Stack** (multiple choice, optional)
12. **Desired Outcomes** (multiple choice, required)
13. **Expected ROI Timeline** (dropdown, optional)
14. **Implementation Budget** (dropdown, optional)

### Contact Information
15. **Email** (email, required)
16. **Phone** (phone, optional)
17. **Best Time to Contact** (dropdown, optional)

## Files

- `typeform-types.ts` - TypeScript types and option arrays for all form fields
- `update-typeform.ts` - Script to update your Typeform with the 17 questions
- `README.md` - This documentation

## After Running the Script

Once the script completes successfully, you can:

1. **View your form**: https://form.typeform.com/to/BYcoTN6c
2. **Edit your form**: https://admin.typeform.com/form/BYcoTN6c/create
3. **View responses**: https://admin.typeform.com/form/BYcoTN6c/results

## Troubleshooting

### "Error: TYPEFORM_API_TOKEN is not set"
- Make sure you've created a `.env` file (not just `.env.example`)
- Verify the token is set correctly in `.env`

### "Unauthorized" or "Invalid token"
- Check that your API token is correct
- Verify the token has `forms:read` and `forms:write` scopes

### "Form not found"
- Verify the `TYPEFORM_FORM_ID` in your `.env` matches your actual form ID
- Check that you own the form or have access to it

## Brand Customization

Your Typeform automatically uses the Nukode brand colors and typography:
- **Background**: `#050505` (nukode-black)
- **Text**: `#e5e5e5` (nukode-text)
- **Accent**: `#ffffff` (white)
- **Typography**:
  - **Playfair Display** (serif) for question titles
  - Inter fallback for body text
  - Matches your website's elegant, minimalist aesthetic
- **Buttons**: Minimal style - white text only, no background or border

The theme creates a dark, sophisticated, ultra-minimal aesthetic that perfectly matches your website.

To modify the theme colors:
1. Edit `scripts/create-typeform-theme.ts`
2. Update the color values in the `theme` object
3. Run `npm run typeform:theme` to apply

## Customizing Questions

To modify the questions or options:

1. Edit `typeform-types.ts` to change the available options
2. Edit `update-typeform-http.ts` to modify questions, descriptions, or validation
3. Run `npm run typeform:update` to apply changes

## Next Steps

After setting up your form, you may want to:

1. **Set up webhooks** to receive responses in real-time
2. **Create a response handler** to calculate ROI automatically
3. **Integrate with your CRM** to track leads

Let me know if you need help with any of these!
