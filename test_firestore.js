require('dotenv').config({path: '.env.local'});
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function testFirestore() {
  try {
    const credJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credJson) throw new Error("Missing GOOGLE_CREDENTIALS_JSON");
    
    // Use the raw unescaped parsed JSON like the python script did to mimic what we pushed to Vercel
    const fs = require('fs');
    const cred = JSON.parse(fs.readFileSync('cred_clean.txt', 'utf8'));

    initializeApp({
      credential: cert(cred),
      projectId: cred.project_id,
    });

    const db = getFirestore();
    const usersSnap = await db.collection("users").limit(1).get();
    console.log("SUCCESS! Firestore is reachable. Users count in test:", usersSnap.docs.length);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

testFirestore();
