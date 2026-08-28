import fs from 'fs';

let code = fs.readFileSync('index.html', 'utf8');

const target = `<meta name="description" content="Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment." />
    <meta name="google-site-verification" content="O_w9vDswtzU8rVi_Wb8stTIVv_A7BzZd8EP2rf4G3wQ" />`;

const replacement = `<meta name="description" content="Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment." />
    <link rel="canonical" href="https://bbincense.in/" />
    
    <meta property="og:title" content="Bhakt & Bhakti Incense | Premium Agarbatti Manufacturer" />
    <meta property="og:description" content="Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment." />
    <meta property="og:url" content="https://bbincense.in/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Bhakt & Bhakti" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Bhakt & Bhakti Incense | Premium Agarbatti Manufacturer" />
    <meta name="twitter:description" content="Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment." />

    <meta name="google-site-verification" content="O_w9vDswtzU8rVi_Wb8stTIVv_A7BzZd8EP2rf4G3wQ" />`;

code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
console.log("Patched index.html");
