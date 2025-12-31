# Typeform to Supabase via Website Integration

This guide explains **3 different approaches** to connect Typeform to your Supabase database through your website.

## 🎯 Comparison of Approaches

| Approach | Data Flow | Pros | Cons | Best For |
|----------|-----------|------|------|----------|
| **1. Webhook (Current)** | Typeform → Vercel API → Supabase | Fast, reliable, no page dependency | No visual feedback on your site | Production, high volume |
| **2. Redirect + Query Params** | Typeform → Your site → Supabase | User stays on your site, visual feedback | URL length limits, data visible in URL | Medium forms |
| **3. Custom Form** | Your site form → Supabase | Full control, branded experience | More dev work, no Typeform features | Full customization needs |

---

## 📍 Approach 1: Webhook (Already Implemented)

This is what I already built. Data flows **directly** from Typeform to your API, bypassing your website initially.

### Flow:
```
Typeform → Webhook → /api/typeform-webhook → Supabase → /api/generate-audit
                                                           ↓
                                               Your website can query results
```

### How to show results on your website:

#### Option A: Query by Email

Add a "Check My Audit" section to your website:

```typescript
// components/CheckAudit.tsx
import React, { useState } from 'react';
import { Button } from './Button';

export const CheckAudit: React.FC = () => {
  const [email, setEmail] = useState('');
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/get-audit?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setAudit(data.data);
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-nukode-dark">
      <div className="max-w-2xl mx-auto px-6">
        <h3 className="text-2xl font-serif text-white mb-6 text-center">
          Check Your Audit Status
        </h3>
        <div className="flex gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-nukode-card border border-white/10 rounded-lg text-white"
          />
          <Button onClick={fetchAudit} disabled={loading}>
            {loading ? 'Loading...' : 'Get Audit'}
          </Button>
        </div>

        {audit && (
          <div className="mt-8 p-6 bg-nukode-card border border-white/10 rounded-xl">
            <h4 className="text-white font-medium mb-4">
              Audit for {audit.company_name}
            </h4>
            <div className="prose prose-invert"
                 dangerouslySetInnerHTML={{ __html: audit.audit_report }} />
          </div>
        )}
      </div>
    </section>
  );
};
```

**Pros:**
- Works with current webhook setup (no changes needed)
- Secure (data not in URL)
- Users can retrieve audits later

**Cons:**
- Requires user to enter email again
- No immediate visual feedback after form submission

---

## 📍 Approach 2: Typeform Redirect with Query Parameters

Typeform redirects users to your website with form data in the URL. Your website captures and stores it.

### Flow:
```
User fills Typeform → Typeform redirects to your-site.com/audit-thank-you?email=...&company_name=...
                                     ↓
                      Your website captures query params → Sends to Supabase
```

### Setup Steps:

#### 1. Configure Typeform Redirect

In your Typeform:
1. Go to **Configure** → **After submit**
2. Select **Redirect to a website**
3. Enter URL with variables:

```
https://your-website.vercel.app/audit-thank-you?email={{field:email}}&company_name={{field:company_name}}&industry={{field:industry}}&company_size={{field:company_size}}&annual_revenue={{field:annual_revenue}}&primary_challenge={{field:primary_challenge}}&time_consuming_processes={{field:time_consuming_processes}}&manual_hours_per_week={{field:manual_hours_per_week}}&employees_on_repetitive_tasks={{field:employees_on_repetitive_tasks}}&hourly_cost_per_employee={{field:hourly_cost_per_employee}}&monthly_operating_costs={{field:monthly_operating_costs}}&current_tech_stack={{field:current_tech_stack}}&desired_outcomes={{field:desired_outcomes}}&expected_roi_timeline={{field:expected_roi_timeline}}&implementation_budget={{field:implementation_budget}}&phone={{field:phone}}&best_time_to_contact={{field:best_time_to_contact}}
```

**Important:** Replace `{{field:email}}` with actual field references from your form.

#### 2. Add Route to Your App

Update `App.tsx` to include the thank you page:

```typescript
import { AuditThankYou } from './components/AuditThankYou';

// Add routing logic (if using React Router)
// Or detect URL path manually:

function App() {
  const path = window.location.pathname;

  if (path === '/audit-thank-you') {
    return <AuditThankYou />;
  }

  // Normal landing page
  return (
    <div className="min-h-screen bg-nukode-black">
      {/* Your existing components */}
    </div>
  );
}
```

#### 3. Test the Flow

1. Fill out Typeform
2. Submit
3. Get redirected to `/audit-thank-you` with query params
4. Component extracts params and sends to `/api/store-submission`
5. API stores in Supabase and triggers audit generation

**Pros:**
- User stays on your website
- Immediate visual feedback ("Processing your audit...")
- Can show custom thank you page
- Can track conversion in your analytics

**Cons:**
- URL length limits (~2000 characters - enough for most forms)
- Data visible in URL (not ideal for sensitive info)
- User can see/modify URL params (validate server-side!)

---

## 📍 Approach 3: Build Custom Form on Your Website

Replace Typeform entirely with your own form.

### Example Implementation:

```typescript
// components/CustomAuditForm.tsx
import React, { useState } from 'react';
import { Button } from './Button';

export const CustomAuditForm: React.FC = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    industry: '',
    company_size: '',
    manual_hours_per_week: 0,
    employees_on_repetitive_tasks: 0,
    hourly_cost_per_employee: '',
    // ... all other fields
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/store-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-12">
        <h2 className="text-3xl text-white mb-4">Thank You!</h2>
        <p className="text-nukode-muted">Your audit is being generated...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-white mb-2">Company Name</label>
        <input
          type="text"
          required
          value={formData.company_name}
          onChange={(e) => setFormData({...formData, company_name: e.target.value})}
          className="w-full px-4 py-3 bg-nukode-card border border-white/10 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-3 bg-nukode-card border border-white/10 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Industry</label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData({...formData, industry: e.target.value})}
          className="w-full px-4 py-3 bg-nukode-card border border-white/10 rounded-lg text-white"
        >
          <option value="">Select...</option>
          <option value="SaaS">SaaS / Technology</option>
          <option value="Ecommerce">E-commerce</option>
          <option value="Professional Services">Professional Services</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Manufacturing">Manufacturing</option>
        </select>
      </div>

      {/* Add all other form fields... */}

      <Button type="submit" className="w-full">
        Generate My Free Audit
      </Button>
    </form>
  );
};
```

**Pros:**
- Complete control over UX/UI
- Fully branded experience
- Real-time validation
- No third-party dependencies
- Data never leaves your domain
- Can implement multi-step wizard
- No external service costs

**Cons:**
- More development work
- Need to build all form features yourself (validation, conditional logic, etc.)
- No Typeform analytics/insights
- Need to maintain form code

---

## 🎨 Hybrid Approach: Embed Typeform + Capture Completion

You can embed Typeform on your website AND use webhooks/redirects:

```typescript
// components/EmbeddedAuditForm.tsx
import React, { useEffect } from 'react';

export const EmbeddedAuditForm: React.FC = () => {
  useEffect(() => {
    // Load Typeform embed script
    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div
        data-tf-widget="BYcoTN6c"
        data-tf-opacity="0"
        data-tf-iframe-props="title=AI Audit Form"
        data-tf-transitive-search-params
        data-tf-medium="snippet"
        data-tf-hidden="utm_source=website,utm_medium=embed"
        style={{ width: '100%', height: '600px' }}
      ></div>
    </div>
  );
};
```

In Typeform settings:
- Still configure webhook to `/api/typeform-webhook`
- OR configure redirect to `/audit-thank-you` with params

**Pros:**
- Keeps Typeform's great UX
- Form lives on your website (better SEO, lower bounce rate)
- Can track with your analytics
- Users don't leave your domain

**Cons:**
- Still dependent on Typeform
- Limited customization of Typeform embed

---

## 🚀 My Recommendation

**For your use case, I recommend:**

### **Hybrid Approach:**
1. **Embed Typeform** on your website (keeps great UX)
2. **Use webhook** for data reliability (already built!)
3. **Add "Check My Audit" feature** on your site so users can retrieve results

**Why?**
- ✅ Professional form experience (Typeform is battle-tested)
- ✅ Reliable data capture (webhook doesn't depend on user's browser)
- ✅ Users stay on your site (better conversion tracking)
- ✅ Can show audit results on your site (better engagement)
- ✅ Minimal development work (leverage what's already built)

### Quick Implementation:

1. Replace the button in `AiConsultant.tsx`:

```typescript
// Instead of opening new tab:
<Button
  className="w-full mt-6"
  onClick={() => window.open('https://form.typeform.com/to/BYcoTN6c', '_blank')}
>

// Scroll to embedded form on same page:
<Button
  className="w-full mt-6"
  onClick={() => document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' })}
>
  Start Your Free Audit
</Button>
```

2. Add embedded form section:

```typescript
// Add to App.tsx or create new component
<section id="audit-form" className="py-24 bg-nukode-dark">
  <div className="max-w-5xl mx-auto px-6">
    <h2 className="text-3xl font-serif text-white text-center mb-12">
      Get Your Free AI Audit
    </h2>
    <div
      data-tf-widget="BYcoTN6c"
      data-tf-opacity="100"
      data-tf-iframe-props="title=AI Audit Form"
      data-tf-transitive-search-params
      data-tf-auto-close="3000"
      style={{ width: '100%', height: '700px' }}
    ></div>
  </div>
</section>
```

3. Add Typeform script to `index.html`:

```html
<script src="//embed.typeform.com/next/embed.js"></script>
```

4. Keep using webhook for data capture (already set up!)

5. Add "Check My Audit" section using the API I created

---

## 📊 Summary

| Approach | Setup Time | Reliability | User Experience | Recommendation |
|----------|------------|-------------|-----------------|----------------|
| **Webhook only** | ✅ Done | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (leaves site) | Good for MVP |
| **Redirect** | 30 min | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ (stays on site) | Good for quick setup |
| **Custom Form** | 4-6 hours | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (full control) | Best long-term |
| **Embed + Webhook** | 15 min | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (best of both) | **RECOMMENDED** |

---

## 🛠️ What I've Built for You

I've created files for **all approaches**:

1. ✅ `/api/typeform-webhook.ts` - Webhook handler (Approach 1)
2. ✅ `/api/store-submission.ts` - Website submission handler (Approach 2 & 3)
3. ✅ `/api/get-audit.ts` - Audit retrieval (all approaches)
4. ✅ `/components/AuditThankYou.tsx` - Thank you page with redirect handling
5. ✅ Original setup guide in `TYPEFORM_SETUP.md`

**You can use any combination!** They all work together.

---

## 🎯 Next Steps

Choose your approach:

### Option A: Embed Typeform (Recommended - 15 min)
1. Add embed code to your website
2. Keep webhook configuration (already done)
3. Optionally add "Check My Audit" section

### Option B: Redirect Flow (30 min)
1. Configure Typeform redirect URL with query params
2. Add routing for `/audit-thank-you`
3. Deploy changes

### Option C: Custom Form (4-6 hours)
1. Build form component with all fields
2. Use `/api/store-submission` endpoint
3. Style to match your brand

**Want me to implement your preferred approach?** Let me know which one and I'll set it up!
