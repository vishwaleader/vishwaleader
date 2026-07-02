'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/app/actions/adminAuth';

// Define a type for the user data. Adjust this to match your Firestore document structure.
interface User {
    id: string;
    email?: string;
    name?: string;
    // Add any other fields you store for a user, for example:
    // registrationDate?: any;
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const result = await getAllUsers();
                if (result.success && result.users) {
                    setUsers(result.users);
                } else {
                    setError(result.error || 'Failed to fetch users.');
                }
            } catch (err) {
                setError('An unexpected error occurred.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
            {users.length === 0 ? (
                <p>No users have registered yet.</p>
            ) : (
                <p>Found {users.length} user(s).</p>
                // You can render the users in a table or list here
            )}
        </div>
    );
}