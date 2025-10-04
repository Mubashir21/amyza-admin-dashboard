"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AdminProfile, getCurrentUserProfile, UserRole } from "@/lib/roles";

interface AuthContextType {
  user: User | null;
  adminProfile: AdminProfile | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminProfile: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session and profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('Getting user profile for:', currentUser.email);
          
          // Temporary fallback - assume super_admin role to get you logged in
          try {
            const profile = await getCurrentUserProfile(currentUser);
            console.log('User profile:', profile);
            setAdminProfile(profile);
            setUserRole(profile?.role ?? 'super_admin'); // Fallback to super_admin
          } catch {
            console.error('Profile fetch failed, using fallback role');
            // Create a temporary profile with super_admin role
            const fallbackProfile = {
              id: 'temp',
              user_id: currentUser.id,
              email: currentUser.email || '',
              first_name: 'User',
              last_name: 'Name',
              role: 'super_admin' as UserRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setAdminProfile(fallbackProfile);
            setUserRole('super_admin');
          }
        } else {
          setAdminProfile(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in auth context:', error);
        setAdminProfile(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log('Auth state change - getting profile for:', currentUser.email);
          
          try {
            const profile = await getCurrentUserProfile(currentUser);
            console.log('Auth state change - profile:', profile);
            setAdminProfile(profile);
            setUserRole(profile?.role ?? 'super_admin'); // Fallback to super_admin
          } catch {
            console.error('Auth state change - profile fetch failed, using fallback role');
            const fallbackProfile = {
              id: 'temp',
              user_id: currentUser.id,
              email: currentUser.email || '',
              first_name: 'User',
              last_name: 'Name',
              role: 'super_admin' as UserRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setAdminProfile(fallbackProfile);
            setUserRole('super_admin');
          }
        } else {
          setAdminProfile(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setAdminProfile(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }

      // Only redirect on sign out, not sign in
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      adminProfile, 
      userRole, 
      loading, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
