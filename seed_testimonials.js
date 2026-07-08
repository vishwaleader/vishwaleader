require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seed = async () => {
  const testimonials = [
    {
      text: "Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus.",
      name: "Morgan Gravel",
      email: "morgan@example.com",
      photoURL: "https://i.pravatar.cc/150?img=47",
      designation: "Cyclist"
    },
    {
      text: "Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec id elit non mi porta gravida at eget metus.",
      name: "Juliet Elliott",
      email: "juliet@example.com",
      photoURL: "https://i.pravatar.cc/150?img=49",
      designation: "Cyclist"
    },
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit.",
      name: "Katie Kookaburra",
      email: "katie@example.com",
      photoURL: "https://i.pravatar.cc/150?img=45",
      designation: "Cyclist"
    },
    {
      text: "Aenean lacinia bibendum nulla sed consectetur. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
      name: "John Doe",
      email: "john@example.com",
      photoURL: "https://i.pravatar.cc/150?img=11",
      designation: "Enthusiast"
    }
  ];

  for (const t of testimonials) {
    await addDoc(collection(db, "testimonials"), {
      ...t,
      createdAt: serverTimestamp()
    });
    console.log("Added:", t.name);
  }
  process.exit(0);
};

seed().catch(console.error);
