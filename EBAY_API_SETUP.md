# eBay API Setup Guide

This guide will help you set up eBay API credentials to get real graded Pokemon card prices.

## Why eBay API?

eBay has the most comprehensive graded card pricing data because:
- Most graded cards are sold on eBay
- Provides real sold listings data (actual market prices)
- Free tier available with generous limits
- Includes PSA, BGS, and CGC graded cards

## Setup Steps

### 1. Create eBay Developer Account

1. Go to https://developer.ebay.com/
2. Click **"Sign In"** or **"Get Started"**
3. Log in with your eBay account (or create a new one)
4. Accept the developer terms and conditions

### 2. Create an Application

1. Go to **"My Account" → "Application Keys"**
2. Click **"Create a new application"**
3. Fill in the application details:
   - **Application Title**: "Pokemon TCG Collection" (or any name)
   - **Application Type**: Select "Production" (for real data)
   - **Description**: "Pokemon card price tracking application"
4. Click **"Create"**

### 3. Get Your API Credentials

After creating the application, you'll see:
- **Client ID** (also called App ID)
- **Client Secret** (also called Cert ID)

**Copy both of these values!**

### 4. Add Credentials to .env File

1. Open your `.env` file in the project root
2. Add the following lines:

```env
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
```

3. Replace `your_client_id_here` and `your_client_secret_here` with your actual credentials
4. Save the file

### 5. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## How It Works

Once configured, the app will:

1. **Automatically fetch real prices** from eBay for graded cards
2. **Fall back to estimates** if eBay API is not configured or has issues
3. **Show data source** in console logs:
   - `source: 'ebay'` = Real eBay data
   - `source: 'estimated'` = Calculated estimates

## Rate Limits

eBay Free Tier includes:
- **5,000 API calls per day**
- **Rate limit**: 5 calls per second

This is more than enough for normal usage. The app caches token for 2 hours to minimize API calls.

## What Data You Get

For each graded card (PSA 10, PSA 9, BGS 9.5, etc.):
- **Average price**: Average of recent sold listings
- **Low price**: Lowest recent sold price
- **High price**: Highest recent sold price
- **Sold count**: Number of sold listings found
- **Recent sales**: Last 10 sold listings with prices and dates

## Troubleshooting

### "eBay API credentials not configured"
- Make sure you added `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` to `.env`
- Restart your dev server after adding credentials

### "eBay OAuth failed: 401"
- Check that your Client ID and Client Secret are correct
- Make sure there are no extra spaces in the `.env` file
- Try regenerating your Client Secret in the eBay Developer Portal

### "No results found"
- This is normal for uncommon cards
- The app will fall back to estimated prices automatically
- More popular cards will have more eBay data

### Still seeing estimates?
- Check browser console for logs showing `[eBay API]` messages
- Look for `source: 'ebay'` vs `source: 'estimated'` in the response
- Make sure card name, set name, and number are correct

## Optional: Enable Sandbox Mode (Testing)

If you want to test without affecting real API limits:

1. Create a **Sandbox application** in eBay Developer Portal
2. Get Sandbox credentials
3. Update `.env`:
```env
EBAY_CLIENT_ID=sandbox_client_id
EBAY_CLIENT_SECRET=sandbox_client_secret
EBAY_ENV=sandbox  # Add this line
```

## Need Help?

- eBay API Documentation: https://developer.ebay.com/api-docs/buy/browse/overview.html
- eBay Developer Forums: https://community.ebay.com/t5/Developer-Forums/ct-p/3001
- Check console logs for detailed error messages

## Future Enhancements

Potential improvements:
1. Cache eBay data in database to reduce API calls
2. Add TCGPlayer graded card integration
3. Include historical price charts from eBay completed listings
4. Add PSA/BGS/CGC population report data
