"use server";

import { getAdminDb } from "@/lib/firebaseAdmin";

export async function getTestimonials() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection("testimonials")
      .orderBy("createdAt", "desc")
      .limit(6)
      .get();
      
    const testimonials = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Anonymous",
        content: data.content || "",
        title: data.title || "",
        company: data.company || "",
        image: data.image || "",
        photoURL: data.photoURL || "",
        rating: data.rating || 5,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      };
    });
    
    return { success: true, data: testimonials };
  } catch (error: any) {
    console.warn("Could not fetch testimonials from Firestore (possibly missing local credentials). Returning fallback data.");
    
    // Fallback data for local development when credentials aren't set
    const fallbackTestimonials = [
      {
        id: "1",
        name: "Dr. A. Sharma",
        content: "An incredible global platform that genuinely amplifies the voices of academic researchers. The conference in London was an eye-opening experience.",
        title: "Senior Researcher",
        company: "Global Studies Institute",
        image: "",
        photoURL: "",
        rating: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "J. Peterson",
        content: "The level of networking and the caliber of speakers at the Business Summit was unparalleled. Highly recommended for international entrepreneurs.",
        title: "CEO",
        company: "Tech Innovations Ltd.",
        image: "",
        photoURL: "",
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ];

    return { success: true, data: fallbackTestimonials };
  }
}
