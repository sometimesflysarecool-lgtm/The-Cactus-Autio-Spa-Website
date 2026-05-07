/**
 * Injects complete JSON-LD structured data into every public HTML page.
 * Replaces any existing application/ld+json blocks so there are no duplicates.
 *
 * Every page gets:  LocalBusiness + AggregateRating
 * Service pages also get: Service node
 *
 * NOTE: Update REVIEW_COUNT to match your actual Google Business Profile total.
 */

const fs   = require('fs');
const path = require('path');
const ROOT = __dirname;

// ─── UPDATE THIS to match your real Google Business Profile ──────────────────
const REVIEW_COUNT  = 10;   // ← your actual Google review count
const RATING_VALUE  = '5.0'; // ← your actual average star rating
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_BUSINESS = {
  '@type': 'LocalBusiness',
  '@id':   'https://cactusautospa.com/#business',
  name:    'Cactus Auto Spa',
  description: 'Premium mobile auto detailing in Mesa & Gilbert, AZ. Interior detailing, ceramic coating, and paint enhancement — we come to you.',
  url:       'https://cactusautospa.com',
  telephone: '(602) 780-3365',
  image:     'https://cactusautospa.com/Brand%20Assets/Photo/AAAAA.webp',
  priceRange: '$$',
  address: {
    '@type':         'PostalAddress',
    addressLocality: 'Mesa',
    addressRegion:   'AZ',
    addressCountry:  'US',
  },
  geo: {
    '@type':    'GeoCoordinates',
    latitude:   33.4152,
    longitude: -111.8315,
  },
  areaServed: [
    { '@type': 'City', name: 'Mesa',    sameAs: 'https://en.wikipedia.org/wiki/Mesa,_Arizona'    },
    { '@type': 'City', name: 'Gilbert', sameAs: 'https://en.wikipedia.org/wiki/Gilbert,_Arizona' },
  ],
  openingHoursSpecification: [
    {
      '@type':   'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      opens:  '06:00',
      closes: '15:00',
    },
    {
      '@type':   'OpeningHoursSpecification',
      dayOfWeek: ['Saturday','Sunday'],
      opens:  '07:00',
      closes: '16:00',
    },
  ],
  aggregateRating: {
    '@type':       'AggregateRating',
    ratingValue:   RATING_VALUE,
    reviewCount:   REVIEW_COUNT,
    bestRating:    '5',
    worstRating:   '1',
  },
  sameAs: ['https://www.facebook.com/profile.php?id=61577441060566'],
};

// Service nodes keyed by filename
const SERVICES = {
  'services.html': {
    '@type':   'Service',
    name:      'Mobile Auto Detailing',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'Premium interior and exterior mobile detailing packages for Mesa & Gilbert, AZ. We come to your home or office with transparent pricing and professional results.',
    areaServed: [
      { '@type': 'City', name: 'Mesa'    },
      { '@type': 'City', name: 'Gilbert' },
    ],
    url: 'https://cactusautospa.com/services.html',
  },
  'ceramic-coating.html': {
    '@type':   'Service',
    name:      'Mobile Ceramic Coating',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'Professional-grade hydrophobic ceramic coating applied at your home or office in Mesa & Gilbert, AZ. Protects against UV rays, Arizona heat, dirt, and everyday wear for 1–5 years.',
    areaServed: [
      { '@type': 'City', name: 'Mesa'    },
      { '@type': 'City', name: 'Gilbert' },
    ],
    url: 'https://cactusautospa.com/ceramic-coating.html',
  },
  'paint-correction.html': {
    '@type':   'Service',
    name:      'Mobile Paint Enhancement',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'One-step paint polish that restores deep gloss and rejuvenates dull, faded paint on vehicles in Mesa & Gilbert, AZ. Mobile service — we come to you.',
    areaServed: [
      { '@type': 'City', name: 'Mesa'    },
      { '@type': 'City', name: 'Gilbert' },
    ],
    url: 'https://cactusautospa.com/paint-correction.html',
  },
  'monthly-membership.html': {
    '@type':   'Service',
    name:      'Monthly Auto Detailing Membership',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'Recurring monthly mobile detailing membership plans serving Mesa & Gilbert, AZ. Keep your vehicle in showroom condition year-round.',
    areaServed: [
      { '@type': 'City', name: 'Mesa'    },
      { '@type': 'City', name: 'Gilbert' },
    ],
    url: 'https://cactusautospa.com/monthly-membership.html',
  },
  'mobile-detailing-mesa-az.html': {
    '@type':   'Service',
    name:      'Mobile Auto Detailing in Mesa, AZ',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'Professional mobile auto detailing serving all of Mesa, AZ. Interior detail, exterior wash, ceramic coating — we come to your home or office.',
    areaServed: { '@type': 'City', name: 'Mesa', sameAs: 'https://en.wikipedia.org/wiki/Mesa,_Arizona' },
    url: 'https://cactusautospa.com/mobile-detailing-mesa-az.html',
  },
  'mobile-detailing-gilbert-az.html': {
    '@type':   'Service',
    name:      'Mobile Auto Detailing in Gilbert, AZ',
    provider:  { '@id': 'https://cactusautospa.com/#business' },
    description: 'Professional mobile auto detailing serving all of Gilbert, AZ. Interior detail, exterior wash, ceramic coating — we come to your home or office.',
    areaServed: { '@type': 'City', name: 'Gilbert', sameAs: 'https://en.wikipedia.org/wiki/Gilbert,_Arizona' },
    url: 'https://cactusautospa.com/mobile-detailing-gilbert-az.html',
  },
};

// Pages to process (skip legal pages — they're noindex)
const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'contact.html',
  'ceramic-coating.html',
  'paint-correction.html',
  'monthly-membership.html',
  'mobile-detailing-mesa-az.html',
  'mobile-detailing-gilbert-az.html',
];

function buildSchema(filename) {
  const graph = [LOCAL_BUSINESS];
  if (SERVICES[filename]) graph.push(SERVICES[filename]);
  return {
    '@context': 'https://schema.org',
    '@graph':   graph,
  };
}

function injectSchema(filePath) {
  const filename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove ALL existing JSON-LD blocks
  const before = (html.match(/<script type="application\/ld\+json">/g) || []).length;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');

  // Build new schema block
  const schema = buildSchema(filename);
  const block = `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`;

  // Inject just before </head>
  if (!html.includes('</head>')) {
    console.error(`  ⚠ No </head> found in ${filename} — skipped`);
    return;
  }
  html = html.replace('</head>', `${block}\n</head>`);

  fs.writeFileSync(filePath, html, 'utf8');

  const serviceLabel = SERVICES[filename] ? ` + Service(${SERVICES[filename].name})` : '';
  console.log(`✓ ${filename.padEnd(38)} removed ${before} old block(s) → LocalBusiness + AggregateRating${serviceLabel}`);
}

for (const page of PAGES) {
  injectSchema(path.join(ROOT, page));
}

console.log('\nDone. Validate at: https://search.google.com/test/rich-results');
console.log(`\n⚠  Remember to update REVIEW_COUNT (currently ${REVIEW_COUNT}) to match your actual Google Business Profile total.`);
