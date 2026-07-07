import { db } from './firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function inspectGuestbookDetails() {
  const q = query(collection(db, 'guestbook'), limit(3));
  const snap = await getDocs(q);
  console.log('=== GUESTBOOK SAMPLE ===');
  snap.forEach(doc => {
    console.log(doc.id, '=>', JSON.stringify(doc.data(), null, 2));
  });
}

inspectGuestbookDetails().then(() => process.exit(0));
