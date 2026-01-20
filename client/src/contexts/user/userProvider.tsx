import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, onAuthStateChanged, User, reloadUserAndRefreshToken } from '../../firebase/config';
import { me, syncEmailVerified } from '../../api/authentication';

export const UserContext = createContext<UserContextInterface | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [userReady, setUserReady] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

    const cacheUserData = (userData: UserInfo) => {
        const data = {
            userData,
            timestamp: Date.now(),
        }
        localStorage.setItem("userData", JSON.stringify(data));
    }

    // Helper function to fetch and set user data
    const fetchUserData = async (fbUser: User) => {
        try {
            const data = await me();
            if (data) {
                const usefulData: UserInfo = {
                    new: (!data.username),
                    username: data.username,
                    displayName: data.displayname,
                    bio: data.bio,
                    // Use backend pfp if available, otherwise fall back to Firebase photo URL
                    pfp: data.pfp || fbUser.photoURL || '',
                    isAnonymous: data.is_anonymous || fbUser.isAnonymous,
                };
                cacheUserData(usefulData);
                setUser(usefulData);
            } else {
                // Firebase user exists but no backend user yet
                // This happens for new Google sign-ins that need registration
                setUser({
                    new: true,
                    username: '',
                    displayName: fbUser.displayName || '',
                    bio: '',
                    pfp: fbUser.photoURL || '',
                    isAnonymous: fbUser.isAnonymous,
                });
            }
        } catch (error) {
            console.log("Error fetching user data from backend", error);
            // Set basic info from Firebase
            setUser({
                new: true,
                username: '',
                displayName: fbUser.displayName || '',
                bio: '',
                pfp: fbUser.photoURL || '',
                isAnonymous: fbUser.isAnonymous,
            });
        }
    };

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log("Firebase auth state changed:", fbUser?.uid);
            setFirebaseUser(fbUser);

            if (fbUser) {
                await fetchUserData(fbUser);
            } else {
                // User is signed out
                localStorage.removeItem("userData");
                setUser(null);
            }
            setUserReady(true);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Refresh token and sync email verification status when user returns to the app
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && firebaseUser && !firebaseUser.isAnonymous) {
                console.log("User returned to app, refreshing token...");
                const isVerified = await reloadUserAndRefreshToken();
                console.log("Email verified status after refresh:", isVerified);
                
                // Sync email verification status with backend
                if (isVerified) {
                    console.log("Syncing email verification with backend...");
                    try {
                        const result = await syncEmailVerified();
                        console.log("Email sync result:", result);
                    } catch (e) {
                        console.error("Error syncing email verification:", e);
                    }
                }
                
                // Re-fetch user data to sync with backend
                if (firebaseUser) {
                    await fetchUserData(firebaseUser);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [firebaseUser]);

    const updateUser = (newUser: UserInfo) => {
        setUser(newUser);
        cacheUserData(newUser);
    }

    const removeUser = () => {
        localStorage.removeItem("userData");
        setUser(null);
    }

    const isUser = (): boolean => {
        // User is logged in and not anonymous and has completed registration
        return user !== null && !user.isAnonymous && !user.new;
    }

    /**
     * Check if the current Firebase user is anonymous
     */
    const isFirebaseAnonymous = (): boolean => {
        return firebaseUser?.isAnonymous ?? false;
    }

    /**
     * Get the current Firebase user (for advanced operations)
     */
    const getFirebaseUser = (): User | null => {
        return firebaseUser;
    }

    return (
        <UserContext.Provider value={{
            user,
            userReady,
            updateUser,
            removeUser,
            isUser,
            isFirebaseAnonymous,
            getFirebaseUser,
        }}>
            {children}
        </UserContext.Provider>
    )
}
