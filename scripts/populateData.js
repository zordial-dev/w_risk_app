import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = `Region	Country	Local Code of Practice Available	Civil Defence Authority (Submission and Approval procedures)	Risk Rating
Middle East	Bahrain	2	1	3
Middle East	Iran	2	3	5
Middle East	Iraq	5	5	10
Middle East	Israel	2	4	6
Middle East	Jordan	3	4	7
Middle East	Kuwait	3	4	7
Middle East	Lebanon	5	5	10
Middle East	Oman	3	1	4
Middle East	Palestine	5	4	9
Middle East	Qatar	2	1	3
Middle East	Saudi Arabia	2	1	3
Middle East	Syria	4	4	8
Middle East	United Arab Emirates	2	1	3
Middle East	Yemen	5	4	9
Africa	Algeria	3	3	6
Africa	Angola	3	3	6
Africa	Benin	4	4	8
Africa	Botswana	5	3	8
Africa	Burkina Faso	4	4	8
Africa	Burundi	4	4	8
Africa	Cape Verde	4	4	8
Africa	Cameroon	5	5	10
Africa	Central African Republic	4	4	8
Africa	Chad	4	3	7
Africa	Comoros	4	4	8
Africa	Democratic Republic of the Congo	4	3	7
Africa	Republic of the Congo	4	3	7
Africa	Djibouti	4	4	8
Africa	Egypt 	2	1	3
Africa	Equatorial Guinea	4	4	8
Africa	Eritrea	4	4	8
Africa	Eswatini	4	4	8
Africa	Ethiopia	2	1	3
Africa	Gabon	4	4	8
Africa	Gambia	3	3	6
Africa	Ghana	2	3	5
Africa	Guinea	4	4	8
Africa	Guinea-Bissau	4	4	8
Africa	Ivory Coast	4	4	8
Africa	Kenya	2	3	5
Africa	Lesotho	2	3	5
Africa	Liberia	4	3	7
Africa	Libya	4	4	8
Africa	Madagascar	4	3	7
Africa	Malawi	3	3	6
Africa	Mali	4	4	8
Africa	Mauritania	4	4	8
Africa	Morocco	4	3	7
Africa	Mozambique	4	3	7
Africa	Namibia	2	3	5
Africa	Niger	4	4	8
Africa	Nigeria	3	3	6
Africa	Rwanda	2	3	5
Africa	Sao Tome and Principe	4	4	8
Africa	Senegal	2	3	5
Africa	Seychelles	4	3	7
Africa	Sierra Leone	4	4	8
Africa	Somalia	4	4	8
Africa	South Africa	1	3	4
Africa	South Sudan	4	4	8
Africa	Sudan	4	4	8
Africa	Tanzania	5	5	10
Africa	Togo	4	3	7
Africa	Tunisia	4	3	7
Africa	Uganda	4	3	7
Africa	Zambia	4	3	7
Africa	Zimbabwe	3	4	7
CIS	Armenia	2	3	5
CIS	Azerbaijan	3	4	7
CIS	Belarus	4	4	8
CIS	Georgia	2	4	6
CIS	Kazakhstan	2	3	5
CIS	Kyrgyzstan	1	1	2
CIS	Moldova	4	4	8
CIS	Russia 	1	1	2
CIS	Tajikistan	3	3	6
CIS	Turkmenistan	4	4	8
CIS	Uzbekistan	2	4	6
Europe	Albania	5	5	10
Europe	Andorra	5	5	10
Europe	Austria	2	1	3
Europe	Belgium	1	1	2
Europe	Bosnia and Herzegovina	3	3	6
Europe	Bulgaria	1	1	2
Europe	Croatia	3	3	6
Europe	Cyprus	2	3	5
Europe	Czech Republic	3	3	6
Europe	Denmark	1	1	2
Europe	Estonia	3	3	6
Europe	Finland	2	3	5
Europe	France	2	1	3
Europe	Germany	1	1	2
Europe	Greece	2	4	6
Europe	Hungary	2	3	5
Europe	Iceland	1	1	2
Europe	Ireland	1	1	2
Europe	Italy	1	1	2
Europe	Kosovo	3	3	6
Europe	Latvia	4	3	7
Europe	Liechtenstein	4	4	8
Europe	Lithuania	4	4	8
Europe	Luxembourg	2	3	5
Europe	Malta	3	1	4
Europe	Monaco	2	1	3
Europe	Montenegro	4	4	8
Europe	Netherlands	1	1	2
Europe	North Macedonia	4	4	8
Europe	Norway	1	4	5
Europe	Poland	1	1	2
Europe	Portugal	3	3	6
Europe	Romania	3	3	6
Europe	San Marino	4	4	8
Europe	Serbia	1	3	4
Europe	Slovakia	3	3	6
Europe	Slovenia	2	3	5
Europe	Spain	1	1	2
Europe	Sweden	3	1	4
Europe	Switzerland	1	1	2
Europe	Turkey 	1	3	4
Europe	Ukraine	2	3	5
Europe	United Kingdom	1	1	2
Europe	Vatican City	1	1	2
Eurasia	Bangladesh	2	3	5
Eurasia	Bhutan	2	4	6
Eurasia	India	3	3	6
Eurasia	Maldives	2	3	5
Eurasia	Nepal	2	3	5
Eurasia	Pakistan	2	3	5
Eurasia	Sri Lanka	2	3	5`;

function calculateRiskBand(score) {
  if (score <= 3) return 'Low';
  if (score === 4) return 'Low-Medium';
  if (score <= 7) return 'Medium';
  if (score === 8) return 'High-Medium';
  return 'High';
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const lines = rawData.trim().split('\n').slice(1);
const records = [];

for (const line of lines) {
  const parts = line.split('\t').map((s) => s.trim());
  if (parts.length >= 5) {
    const region = parts[0];
    const country = parts[1];
    const cop = parseInt(parts[2], 10);
    const cda = parseInt(parts[3], 10);
    const score = parseInt(parts[4], 10) || cop + cda;
    const band = calculateRiskBand(score);
    const id = `${slugify(region)}-${slugify(country)}`;

    records.push({
      id,
      region,
      country,
      cop,
      cda,
      score,
      band,
    });
  }
}

console.log(`Parsed ${records.length} country records.`);

// 1. Generate updated initialData.ts
const tsContent = `import { CountryRiskRecord } from '../types/risk';

export const INITIAL_COUNTRY_DATA: CountryRiskRecord[] = ${JSON.stringify(records, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../src/data/initialData.ts');
fs.writeFileSync(targetPath, tsContent, 'utf-8');
console.log(`Wrote ${records.length} records to ${targetPath}`);

// 2. Connect to Firestore and insert into database
const firebaseConfig = {
  apiKey: "AIzaSyD3QPdDoWT3Fw7XDyDUWKI59gcC2nsjcao",
  authDomain: "digigate-330c0.firebaseapp.com",
  projectId: "digigate-330c0",
  storageBucket: "digigate-330c0.firebasestorage.app",
  messagingSenderId: "183160263199",
  appId: "1:183160263199:web:b7901ab625e1404f50bb2a",
  measurementId: "G-ZYDB0CQS02"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'wyndham-risk-db');

async function syncToFirestore() {
  console.log('Connecting to Firestore project digigate-330c0...');
  const batch = writeBatch(db);

  for (const item of records) {
    const docRef = doc(db, 'countries', item.id);
    batch.set(docRef, item, { merge: true });
  }

  console.log('Committing batch write of 129 countries to Firestore...');
  
  const commitPromise = batch.commit();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('TIMEOUT: Firestore did not respond within 15s. This happens if Cloud Firestore database has not been created yet in the Firebase Console for project digigate-330c0.')), 15000)
  );

  await Promise.race([commitPromise, timeoutPromise]);
  console.log('Batch commit successfully finished!');

  // Verify by fetching
  const snap = await getDocs(collection(db, 'countries'));
  console.log(`Verification: Firestore collection 'countries' now has ${snap.size} documents.`);
  process.exit(0);
}

syncToFirestore().catch((err) => {
  console.error('\nSync failed:', err.message);
  console.log('\n--> ACTION REQUIRED:');
  console.log('Please ensure you have clicked "Create database" in Firebase Console:');
  console.log('https://console.firebase.google.com/project/digigate-330c0/firestore\n');
  process.exit(1);
});
