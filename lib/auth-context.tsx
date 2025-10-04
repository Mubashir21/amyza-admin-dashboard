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
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setAdminProfile(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('Getting user profile for:', currentUser.email);
          
          try {
            const profile = await getCurrentUserProfile(currentUser);
            console.log('User profile:', profile);
            
            if (profile) {
              setAdminProfile(profile);
              setUserRole(profile.role);
            } else {
              // No profile found - create fallback
              console.warn('No profile found for user, using fallback');
              const fallbackProfile: AdminProfile = {
                id: 'temp',
                user_id: currentUser.id,
                email: currentUser.email || '',
                first_name: currentUser.user_metadata?.first_name || 'User',
                last_name: currentUser.user_metadata?.last_name || 'Name',
                role: 'super_admin' as UserRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setAdminProfile(fallbackProfile);
              setUserRole('super_admin');
            }
          } catch (error) {
            console.error('Profile fetch failed:', error);
            // Create a temporary profile with super_admin role
            const fallbackProfile: AdminProfile = {
              id: 'temp',
              user_id: currentUser.id,
              email: currentUser.email || '',
              first_name: currentUser.user_metadata?.first_name || 'User',
              last_name: currentUser.user_metadata?.last_name || 'Name',
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
        console.error('Error initializing auth:', error);
        setUser(null);
        setAdminProfile(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log('Auth state change - getting profile for:', currentUser.email);
          
          try {
            const profile = await getCurrentUserProfile(currentUser);
            console.log('Auth state change - profile:', profile);
            
            if (profile) {
              setAdminProfile(profile);
              setUserRole(profile.role);
            } else {
              console.warn('Auth state change - no profile found, using fallback');
              const fallbackProfile: AdminProfile = {
                id: 'temp',
                user_id: currentUser.id,
                email: currentUser.email || '',
                first_name: currentUser.user_metadata?.first_name || 'User',
                last_name: currentUser.user_metadata?.last_name || 'Name',
                role: 'super_admin' as UserRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setAdminProfile(fallbackProfile);
              setUserRole('super_admin');
            }
          } catch (error) {
            console.error('Auth state change - profile fetch error:', error);
            const fallbackProfile: AdminProfile = {
              id: 'temp',
              user_id: currentUser.id,
              email: currentUser.email || '',
              first_name: currentUser.user_metadata?.first_name || 'User',
              last_name: currentUser.user_metadata?.last_name || 'Name',
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
        setUser(null);
        setAdminProfile(null);
        setUserRole(null);
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
