# ThirdShift Demo Website

A simple single-page web app to test and demonstrate all ThirdShift Lambda functions.

## Features

- ✅ Test Profile Manager (via API Gateway)
- ✅ Test Inventory Manager (shows CLI commands)
- ✅ Test Calendar Analyzer (shows mock data)
- 📊 Visual dashboard showing component status
- 💾 Saves API URL in browser localStorage

## Setup

### 1. Get Your API Gateway URL

```bash
cd infrastructure/environments/dev
terraform output api_gateway_url
```

Copy the URL (e.g., `https://abc123.execute-api.us-west-2.amazonaws.com/dev/profiles`)

### 2. Open the Demo

Simply open `index.html` in your browser:

```bash
cd web-demo
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

### 3. Configure

Paste your API Gateway URL into the configuration field at the top.

### 4. Test Components

Click the "Test" buttons to try each component:
- **Profile Manager**: Creates a real test profile via API
- **Inventory Manager**: Shows CLI commands and mock response
- **Calendar Analyzer**: Shows mock calendar analysis

## Hosting (Optional)

### Option 1: Local Python Server

```bash
cd web-demo
python3 -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Deploy to S3

```bash
# Create S3 bucket
aws s3 mb s3://thirdshift-demo --region us-west-2

# Enable static website hosting
aws s3 website s3://thirdshift-demo \
  --index-document index.html

# Upload files
aws s3 sync . s3://thirdshift-demo --acl public-read

# Get URL
echo "http://thirdshift-demo.s3-website-us-west-2.amazonaws.com"
```

### Option 3: Deploy to Netlify/Vercel

Just drag and drop the `web-demo` folder to:
- https://app.netlify.com/drop
- https://vercel.com/new

## What It Shows

### Working Components (Green ✓)
- Profile Manager - Full CRUD API
- Inventory Manager - Inventory tracking
- Calendar Analyzer - Availability analysis

### Coming Soon (Orange)
- Menu Generator - AI meal planning
- Shopping Agent - Oda integration
- Budget Tracker - Spending monitoring

## Screenshots

The demo shows:
- Component status badges
- Interactive test buttons
- Real-time API responses
- Formatted JSON output
- Error handling
- Loading states

## Next Steps

After testing:
1. Show this to stakeholders
2. Implement Menu Generator (Task 6)
3. Add Shopping Agent (Task 8)
4. Update demo with new components

## Customization

Edit `app.js` to:
- Add real API calls for Inventory/Calendar
- Customize test data
- Add more detailed visualizations
- Integrate with AWS SDK for direct Lambda calls

Edit `index.html` to:
- Change colors/styling
- Add more components
- Customize layout
- Add charts/graphs
