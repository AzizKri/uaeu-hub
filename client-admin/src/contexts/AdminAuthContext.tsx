import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase/config';
import { checkAdminEmail, getMe } from '../api/admin';

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}

interface AdminAuthProviderProps {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            
            if (fbUser) {
                // Verify this user is an admin
                const adminUser = await getMe();
                if (adminUser) {
                    setUser(adminUser);
                } else {
                    // Not an admin, sign them out
                    await signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        
        try {
            // First check if email is admin
            const adminCheck = await checkAdminEmail(email);
            
            if (!adminCheck.isAdmin) {
                setIsLoading(false);
                return { success: false, error: 'Access denied. Admin privileges required.' };
            }

            // Proceed with Firebase login
            await signInWithEmailAndPassword(auth, email, password);
            
            // Get admin user data
            const adminUser = await getMe();
            if (adminUser) {
                setUser(adminUser);
                return { success: true };
            } else {
                await signOut(auth);
                return { success: false, error: 'Failed to verify admin status' };
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            let errorMessage = 'Login failed';
            
            if (firebaseError.code === 'auth/user-not-found') {
                errorMessage = 'User not found';
            } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid credentials';
            } else if (firebaseError.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
