import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function listAllNames() {
  const snap = await getDocs(collection(db, 'guestbook'));
  console.log(`Total guestbook docs: ${snap.size}`);
  const names = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
  console.log(JSON.stringify(names, null, 2));
}

listAllNames()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
