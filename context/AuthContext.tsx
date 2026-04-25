'use client'

import { getUser } from "@/actions/auth/get-user";
import { User } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    getUserData:() => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await getUser();
            if(userData) {
                setUser(userData);
            } 
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const authState = async () => {
        const supabase = createClient();

        supabase.auth.onAuthStateChange((event, session) => {
            const eventTypes = ['INITIAL_SESSION', 'USER_UPDATED', 'TOKEN_REFRESHED','PASSWORD_RECOVERY','SIGNED_OUT'];

            if(eventTypes.includes(event)) {
                if(session) {
                    getUserData();
                } else {
                    setUser(null);
                }
            }

        });
    }

    useEffect(() => {
        authState();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, getUserData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}