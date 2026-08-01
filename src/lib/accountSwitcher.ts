export interface SavedAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastLogin: number;
}

const SAVED_ACCOUNTS_KEY = 'vishwa_saved_accounts';

export function getSavedAccounts(): SavedAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    const accounts = JSON.parse(raw);
    return Array.isArray(accounts) ? accounts : [];
  } catch (e) {
    return [];
  }
}

export function saveAccount(user: { uid: string; email: string | null; displayName?: string | null; photoURL?: string | null }): SavedAccount[] {
  if (typeof window === 'undefined' || !user || !user.uid || !user.email) return getSavedAccounts();
  try {
    const existing = getSavedAccounts();
    const filtered = existing.filter((acc) => acc.uid !== user.uid && acc.email.toLowerCase() !== user.email!.toLowerCase());
    const updated: SavedAccount = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || undefined,
      lastLogin: Date.now(),
    };
    const newAccounts = [updated, ...filtered].slice(0, 8); // Keep up to 8 desktop accounts
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(newAccounts));
    return newAccounts;
  } catch (e) {
    return getSavedAccounts();
  }
}

export function removeSavedAccount(uid: string): SavedAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedAccounts();
    const updated = existing.filter((acc) => acc.uid !== uid);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getSavedAccounts();
  }
}
