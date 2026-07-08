const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const cred = require('./firebase_admin_cred.json');

const adminApp = initializeApp({
  credential: cert(cred),
  projectId: cred.project_id,
});

async function test() {
  try {
    const db1 = getFirestore(adminApp); // Defaults to (default)
    await db1.collection('users').limit(1).get();
    console.log('db1 success');
  } catch(e) {
    console.error('db1 error:', e.message);
  }
  
  try {
    const db2 = getFirestore(adminApp, 'default');
    await db2.collection('users').limit(1).get();
    console.log('db2 success');
  } catch(e) {
    console.error('db2 error:', e.message);
  }
}

test();
