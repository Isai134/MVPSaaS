import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/supabase';

type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  school_id: string | null;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: AppRole,
    schoolId?: string | null,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParent: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setProfile(null);
    } else {
      setProfile(profileData as UserProfile | null);
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setRoles([]);
    } else {
      setRoles((rolesData ?? []).map((r) => r.role as AppRole));
    }
  };

  const loadSessionAndUser = async (currentSession: Session | null) => {
    try {
      setIsLoading(true);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserData(currentSession.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
    } catch (error) {
      console.error('loadSessionAndUser error:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (!mounted) return;
        await loadSessionAndUser(currentSession);
      } catch (error) {
        console.error('Bootstrap auth error:', error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
        setIsLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setTimeout(() => {
        if (!mounted) return;
        loadSessionAndUser(newSession);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: AppRole = 'alumno',
    schoolId: string | null = null,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error || !data.user) {
      return { error: error ?? new Error('No se pudo crear la cuenta') };
    }

    const userId = data.user.id;

    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        user_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
      },
      { onConflict: 'user_id' },
    );

    if (profileErr) {
      return { error: profileErr as unknown as Error };
    }

    if (schoolId) {
      const { error: roleErr } = await supabase.from('user_roles').upsert(
        {
          user_id: userId,
          school_id: schoolId,
          role,
        },
        { onConflict: 'user_id,school_id,role' },
      );

      if (roleErr) {
        return { error: roleErr as unknown as Error };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ?? null };
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const isAdmin = useMemo(() => {
    return roles.includes('super_admin') || roles.includes('directivo');
  }, [roles]);

  const isStaff = useMemo(() => {
    return isAdmin || roles.includes('administrativo');
  }, [isAdmin, roles]);

  const isTeacher = useMemo(() => {
    return roles.includes('profesor');
  }, [roles]);

  const isStudent = useMemo(() => {
    return roles.includes('alumno');
  }, [roles]);

  const isParent = useMemo(() => {
    return roles.includes('padre');
  }, [roles]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        hasRole,
        isAdmin,
        isStaff,
        isTeacher,
        isStudent,
        isParent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}