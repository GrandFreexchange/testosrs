#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'items');
const API_HEADERS = { 'User-Agent': 'osrs.lol bot' };
const BATCH_SIZE = 50;
const RATE_LIMIT_MS = 100;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Utility to fetch from API
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: API_HEADERS }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(new Error(`JSON parse error for ${url}: ${err.message}`));
                }
            });
        }).on('error', reject);
    });
}

// Convert item name to URL slug
function nameToSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Generate HTML template for item page
function generateItemHTML(item, latestPrice, volume) {
    const slug = nameToSlug(item.name);
    const priceUp = latestPrice.high > latestPrice.low;
    const priceDiff = latestPrice.high - latestPrice.low;
    const profitPercent = ((priceDiff / latestPrice.low) * 100).toFixed(2);
    const baseUrl = 'https://www.osrs.lol';
    const itemUrl = `${baseUrl}/items/${slug}.html`;
    
    return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.name} - OSRS Grand Exchange Price & Flipping Analysis</title>
    <meta name="description" content="Real-time ${item.name} price data, trading volume, and profit analysis for OSRS Grand Exchange. Current price: ${latestPrice.high} GP. High volume flipping opportunity.">
    <meta name="keywords" content="${item.name}, OSRS, Grand Exchange, price, flipping, ${priceUp ? 'profit' : 'loss'}, trading, RuneScape">
    <meta name="author" content="GrandFreexchange">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="theme-color" content="#e7bc1c">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${item.name} - OSRS Price & Trading Analysis">
    <meta property="og:description" content="Live Grand Exchange price data for ${item.name}. High: ${latestPrice.high} GP, Low: ${latestPrice.low} GP. Volume: ${volume.toLocaleString()} items/4h.">
    <meta property="og:url" content="${itemUrl}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://oldschool.runescape.wiki/images/Coins_10000.png">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${item.name} - OSRS GE Price">
    <meta name="twitter:description" content="High: ${latestPrice.high} GP | Low: ${latestPrice.low} GP | Spread: ${priceDiff} GP (${profitPercent}%)">
    <meta name="twitter:image" content="https://oldschool.runescape.wiki/images/Coins_10000.png">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${itemUrl}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="https://oldschool.runescape.wiki/images/Coins_10000.png">
    <link rel="apple-touch-icon" href="https://oldschool.runescape.wiki/images/Coins_10000.png">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${item.name}",
        "description": "OSRS Grand Exchange item: ${item.name}",
        "brand": {
            "@type": "Organization",
            "name": "GrandFreexchange"
        },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "OSRS GP",
            "lowPrice": "${latestPrice.low}",
            "highPrice": "${latestPrice.high}",
            "offerCount": "${volume}"
        },
        "url": "${itemUrl}",
        "itemId": "${item.id}"
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "${baseUrl}/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Items",
                "item": "${baseUrl}/items/"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "${item.name}",
                "item": "${itemUrl}"
            }
        ]
    }
    </script>
    
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4152492769881576" crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-4152492769881576">
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-JK70X6NNKM"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-JK70X6NNKM');
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-dark: #211e1c;
            --bg-main: #3a3532;
            --bg-contrast: #2a2725;
            --border-color: #504a45;
            --text-primary: #e5e0db;
            --text-secondary: #a8a29e;
            --accent-gold: #e7bc1c;
            --accent-green: #22c55e;
            --accent-red: #ef4444;
        }
        body {
            background-color: var(--bg-dark);
            color: var(--text-primary);
            font-family: 'Inter', sans-serif;
        }
        .bg-main { background-color: var(--bg-main); }
        .bg-dark-contrast { background-color: var(--bg-contrast); }
        .border-custom { border-color: var(--border-color); }
        .text-accent { color: var(--accent-gold); }
        .text-profit { color: var(--accent-green); }
        .text-loss { color: var(--accent-red); }
        .text-secondary { color: var(--text-secondary); }
        .text-volume { color: #3b82f6; }
    </style>
</head>
<body class="font-sans">
    <div class="container mx-auto max-w-6xl p-4 md:p-8">
        <header class="text-center mb-8">
            <div class="flex justify-center items-center space-x-4 mb-4">
                <img src="https://oldschool.runescape.wiki/images/Coins_10000.png" alt="OSRS Coins" class="h-12">
                <div>
                    <h1 class="text-4xl font-bold mb-2">
                        <a href="/" class="text-accent no-underline hover:opacity-80">${item.name}</a>
                    </h1>
                    <p class="text-lg text-secondary">OSRS Grand Exchange Price Analysis</p>
                </div>
                <img src="https://oldschool.runescape.wiki/images/Coins_10000.png" alt="OSRS Coins" class="h-12 transform -scale-x-100">
            </div>
            <nav class="mb-6">
                <a href="/" class="text-accent hover:opacity-80 mr-4">← Back to Tool</a>
            </nav>
        </header>

        <main>
            <section class="bg-main border border-custom rounded-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-accent mb-4">Current Market Data</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-dark-contrast p-4 rounded">
                        <p class="text-secondary text-sm mb-1">High Price</p>
                        <p class="text-2xl font-bold">${latestPrice.high.toLocaleString()}</p>
                        <p class="text-xs text-secondary mt-2">GP</p>
                    </div>
                    <div class="bg-dark-contrast p-4 rounded">
                        <p class="text-secondary text-sm mb-1">Low Price</p>
                        <p class="text-2xl font-bold">${latestPrice.low.toLocaleString()}</p>
                        <p class="text-xs text-secondary mt-2">GP</p>
                    </div>
                    <div class="bg-dark-contrast p-4 rounded">
                        <p class="text-secondary text-sm mb-1">Spread / Profit Potential</p>
                        <p class="text-2xl font-bold ${priceUp ? 'text-profit' : 'text-loss'}">${priceDiff.toLocaleString()}</p>
                        <p class="text-xs text-secondary mt-2">${profitPercent}% margin</p>
                    </div>
                </div>

                <div class="bg-dark-contrast p-4 rounded">
                    <p class="text-secondary text-sm mb-1">Trading Volume (4 hour)</p>
                    <p class="text-2xl font-bold text-volume">${volume.toLocaleString()}</p>
                    <p class="text-xs text-secondary mt-2">Items traded per 4 hours</p>
                </div>
            </section>

            <section class="bg-main border border-custom rounded-lg p-6">
                <h2 class="text-2xl font-bold text-accent mb-4">About ${item.name}</h2>
                <p class="text-secondary mb-4">
                    This page provides real-time Grand Exchange price data for <strong>${item.name}</strong> in Old School RuneScape. 
                    The high-low price spread and trading volume are updated regularly to help you make informed trading decisions.
                </p>
                <p class="text-secondary mb-4">
                    <strong>Item ID:</strong> ${item.id}
                </p>
                <p class="text-secondary">
                    For a complete analysis tool with advanced flipping strategies and budget-based recommendations, 
                    <a href="/" class="text-accent hover:underline">return to the main OSRS flipping tool</a>.
                </p>
            </section>
        </main>

        <footer class="text-center text-secondary text-sm mt-12 py-6 border-t border-custom">
            <p>Data provided by <a href="https://prices.runescape.wiki/" class="text-accent hover:underline">RuneScape Wiki</a></p>
            <p class="mt-2">Last updated: ${new Date().toISOString().split('T')[0]}</p>
        </footer>
    </div>
</body>
</html>`;
}

// Main build function
async function build() {
    console.log('🏗️ Starting OSRS item page generation...');
    
    try {
        // Fetch item mapping
        console.log('📥 Fetching item data from RuneScape Wiki API...');
        const mapping = await fetchJSON('https://prices.runescape.wiki/api/v1/osrs/mapping');
        console.log(`✅ Found ${mapping.length} items`);

        // Fetch latest prices
        console.log('💰 Fetching latest prices...');
        const latest = await fetchJSON('https://prices.runescape.wiki/api/v1/osrs/latest');

        // Fetch volumes
        console.log('📊 Fetching trading volumes...');
        const volumes = await fetchJSON('https://prices.runescape.wiki/api/v1/osrs/volumes');

        // Generate pages in batches
        let processed = 0;
        const errors = [];
        
        for (let i = 0; i < mapping.length; i += BATCH_SIZE) {
            const batch = mapping.slice(i, i + BATCH_SIZE);
            
            for (const item of batch) {
                try {
                    const itemLatest = latest[item.id] || { high: 0, low: 0 };
                    const itemVolume = volumes[item.id] || 0;
                    
                    // Generate page for all items (will show placeholder if no price data)
                    const html = generateItemHTML(item, itemLatest, itemVolume);
                    const slug = nameToSlug(item.name);
                    const filePath = path.join(OUTPUT_DIR, `${slug}.html`);
                    
                    fs.writeFileSync(filePath, html, 'utf8');
                    processed++;
                    
                    if (processed % 100 === 0) {
                        console.log(`⏳ Processed ${processed} items...`);
                    }
                } catch (err) {
                    errors.push(`${item.name}: ${err.message}`);
                }
            }
            
            // Rate limiting
            if (i + BATCH_SIZE < mapping.length) {
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
            }
        }

        console.log(`\n✨ Successfully generated ${processed} item pages in /items/`);
        
        if (errors.length > 0) {
            console.warn(`⚠️ Encountered ${errors.length} errors:`);
            errors.slice(0, 10).forEach(err => console.warn(`  - ${err}`));
            if (errors.length > 10) console.warn(`  ... and ${errors.length - 10} more`);
        }

        // Generate updated sitemap
        console.log('🗺️ Generating sitemap...');
        generateSitemap(mapping, latest);
        
        console.log('✅ Build complete!');
    } catch (err) {
        console.error('❌ Build failed:', err.message);
        process.exit(1);
    }
}

// Generate sitemap with all item pages
function generateSitemap(items, latest) {
    const baseUrl = 'https://www.osrs.lol';
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
`;

    for (const item of items) {
        const slug = nameToSlug(item.name);
        sitemap += `    <url>
        <loc>${baseUrl}/items/${slug}.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
`;
    }

    sitemap += `</urlset>`;
    fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
}

// Run build
build();
