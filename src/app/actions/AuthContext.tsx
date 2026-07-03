'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import db as well
import GlobalPreloader from '@/components/GlobalPreloader';
import { Firestore } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    auth: Auth;
    db: Firestore;
}

const AuthContext = createContext<AuthContextType>({ user: null, auth, db });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <GlobalPreloader />;
    }

    return <AuthContext.Provider value={{ user, auth, db }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);