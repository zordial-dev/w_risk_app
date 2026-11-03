import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  deleteDoc, 
  writeBatch, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { CountryRiskRecord, RiskBand } from '../types/risk';
import { INITIAL_COUNTRY_DATA } from '../data/initialData';

const COUNTRIES_COLLECTION = 'countries';

export const calculateRiskBand = (score: number): RiskBand => {
  if (score <= 3) return 'Low';
  if (score === 4) return 'Low-Medium';
  if (score <= 7) return 'Medium';
  if (score === 8) return 'High-Medium';
  return 'High';
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// Seed countries to Firestore using batch write
export const seedCountriesToFirestore = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const country of INITIAL_COUNTRY_DATA) {
      const docRef = doc(db, COUNTRIES_COLLECTION, country.id);
      batch.set(docRef, country, { merge: true });
      count++;
    }

    await batch.commit();
    return { success: true, count };
  } catch (err: any) {
    console.error('Error seeding countries to Firestore:', err);
    return { success: false, count: 0, error: err?.message || 'Failed to seed database' };
  }
};

// Listen to countries collection in real-time from Firestore
export const subscribeToCountryData = (
  onSuccess: (data: CountryRiskRecord[], source: 'firestore') => void,
  onError?: (err: any) => void
) => {
  try {
    const colRef = collection(db, COUNTRIES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: CountryRiskRecord[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const cop = Number(data.cop || 1);
            const cda = Number(data.cda || 1);
            const score = Number(data.score || cop + cda);
            return {
              id: docSnap.id,
              country: data.country || '',
              region: data.region || '',
              cop,
              cda,
              score,
              band: (data.band as RiskBand) || calculateRiskBand(score),
              disabled: Boolean(data.disabled),
            };
          });
          // Sort alphabetically by country name
          list.sort((a, b) => a.country.localeCompare(b.country));
          onSuccess(list, 'firestore');
        } else {
          // If Firestore is empty, auto-seed the records
          console.log('Firestore collection is empty. Auto-seeding countries to cloud database...');
          try {
            await seedCountriesToFirestore();
          } catch (e) {
            console.error('Seeding error:', e);
            if (onError) onError(e);
          }
        }
      },
      (err) => {
        console.warn('Firestore subscription error:', err.message);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Firestore connection error:', err);
    if (onError) onError(err);
    return () => {};
  }
};

// Update a country's score in Firestore database
export const updateCountryInFirestore = async (
  countryId: string,
  cop: number,
  cda: number
): Promise<boolean> => {
  try {
    const totalScore = cop + cda;
    const band = calculateRiskBand(totalScore);
    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    await setDoc(docRef, { cop, cda, score: totalScore, band }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to update country in Firestore:', err);
    return false;
  }
};

// Full edit of a country in Firestore database
export const editCountryInFirestore = async (
  countryId: string,
  params: {
    country: string;
    region: string;
    cop: number;
    cda: number;
    disabled?: boolean;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const cleanCountry = params.country.trim();
    const cleanRegion = params.region.trim();
    if (!cleanCountry || cleanCountry.length < 2) {
      return { success: false, error: 'Country name must be at least 2 characters.' };
    }
    if (!cleanRegion || cleanRegion.length < 2) {
      return { success: false, error: 'Region must be at least 2 characters.' };
    }
    const score = params.cop + params.cda;
    const band = calculateRiskBand(score);

    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    await setDoc(
      docRef,
      {
        country: cleanCountry,
        region: cleanRegion,
        cop: params.cop,
        cda: params.cda,
        score,
        band,
        ...(params.disabled !== undefined ? { disabled: params.disabled } : {})
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('Failed to edit country in Firestore:', err);
    return { success: false, error: err?.message || 'Failed to update country in database' };
  }
};

// Add a new country to Firestore database
export const addCountryToFirestore = async (params: {
  country: string;
  region: string;
  cop: number;
  cda: number;
}): Promise<{ success: boolean; country?: CountryRiskRecord; error?: string }> => {
  try {
    const cleanCountry = params.country.trim();
    const cleanRegion = params.region.trim();
    if (!cleanCountry || !cleanRegion) {
      return { success: false, error: 'Country name and Region are required.' };
    }

    const id = `${slugify(cleanRegion)}-${slugify(cleanCountry)}`;
    const score = params.cop + params.cda;
    const band = calculateRiskBand(score);

    const newRecord: CountryRiskRecord = {
      id,
      country: cleanCountry,
      region: cleanRegion,
      cop: params.cop,
      cda: params.cda,
      score,
      band,
      disabled: false,
    };

    const docRef = doc(db, COUNTRIES_COLLECTION, id);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      return { 
        success: false, 
        error: `A jurisdiction record for "${cleanCountry}" in region "${cleanRegion}" already exists.` 
      };
    }

    await setDoc(docRef, newRecord);
    return { success: true, country: newRecord };
  } catch (err: any) {
    console.error('Failed to add country to Firestore:', err);
    return { success: false, error: err?.message || 'Failed to add country' };
  }
};

// Delete a country from Firestore database
export const deleteCountryFromFirestore = async (countryId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to delete country from Firestore:', err);
    return false;
  }
};

// Toggle country disabled/active status
export const toggleCountryDisabled = async (countryId: string, disabled: boolean): Promise<boolean> => {
  try {
    const docRef = doc(db, COUNTRIES_COLLECTION, countryId);
    await setDoc(docRef, { disabled }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to toggle country status in Firestore:', err);
    return false;
  }
};

// Bulk replace and entirely overlap countries with uploaded records
// If uploaded records are less than the existing data, obsolete records are removed so the new data cleanly replaces it.
export const bulkUpsertCountries = async (
  records: CountryRiskRecord[]
): Promise<{ success: boolean; count: number; deletedCount: number; error?: string }> => {
  try {
    if (!records || records.length === 0) {
      return { success: false, count: 0, deletedCount: 0, error: 'No records provided to upload.' };
    }

    const colRef = collection(db, COUNTRIES_COLLECTION);
    const existingSnap = await getDocs(colRef);
    const newIdSet = new Set(records.map((r) => r.id));

    // Identify all previous records that do NOT exist in the new uploaded file
    const toDeleteRefs = existingSnap.docs
      .filter((d) => !newIdSet.has(d.id))
      .map((d) => d.ref);

    const CHUNK_SIZE = 400; // Firestore limit is 500 per batch

    // 1. Write the new records first (with merge: false to completely replace contents)
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const docRef = doc(db, COUNTRIES_COLLECTION, item.id);
        batch.set(docRef, item, { merge: false });
      }

      await batch.commit();
    }

    // 2. Delete all old records that are not in the new uploaded dataset
    for (let i = 0; i < toDeleteRefs.length; i += CHUNK_SIZE) {
      const chunk = toDeleteRefs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const ref of chunk) {
        batch.delete(ref);
      }

      await batch.commit();
    }

    return { 
      success: true, 
      count: records.length, 
      deletedCount: toDeleteRefs.length 
    };
  } catch (err: any) {
    console.error('Bulk replacement failed:', err);
    return { success: false, count: 0, deletedCount: 0, error: err?.message || 'Bulk sync error' };
  }
};
