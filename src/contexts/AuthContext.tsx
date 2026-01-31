import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, UserProfile } from '@/types/database';

type SignInResult = { error: Error | null };
type SignUpResult = { error: Error | null };

// ✅ Switch de rol (modo demo)
const DEV_ROLE_LS_KEY = "eduflow:devRoleOverride";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  isLoading: boolean;

  signIn: (email: string, password: string) => Promise<SignInResult>;

  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: AppRole
  ) => Promise<SignUpResult>;

  signOut: () => Promise<void>;

  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        setProfile(null);
      }

      // Roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        setRoles([]);
      } else {
        const realRoles = (rolesData ?? []).map((r) => r.role as AppRole);

        // ✅ Override sólo en DEV (modo demo)
        if (import.meta.env.DEV) {
          const override = localStorage.getItem(DEV_ROLE_LS_KEY) as AppRole | null;
          if (override) {
            setRoles([override]); // fuerza un solo rol simulado
            return;
          }
        }

        setRoles(realRoles);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfile(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    // Listener de auth primero
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setTimeout(() => {
          fetchUserData(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }

      setIsLoading(false);
    });

    // Luego revisar sesión existente
    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          fetchUserData(existingSession.user.id);
        } else {
          setProfile(null);
          setRoles([]);
        }

        setIsLoading(false);
      })
      .catch((e) => {
        console.error('Error getting session:', e);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: (error as Error) ?? null };
  };

  // ✅ Registro robusto:
  // - signUp en auth
  // - upsert en profiles (evita duplicate key)
  // - upsert en user_roles (evita duplicate key)
  // - fallback: si el email ya existe, intenta signIn automático
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: AppRole = 'alumno'
  ): Promise<SignUpResult> => {
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

    // 🔁 Si el usuario ya existe o hubo un error típico de signup,
    // intentamos iniciar sesión (muy útil en demos después de varios intentos).
    if (error || !data.user) {
      // Intento de fallback a signIn
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInErr) {
        return { error: null };
      }
      return { error: (error as Error) ?? (signInErr as Error) ?? new Error('No se pudo crear el usuario') };
    }

    const userId = data.user.id;

    // 1) profiles (upsert para evitar duplicate key)
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
        },
        { onConflict: 'user_id' }
      );

    if (profileErr) {
      return { error: profileErr as unknown as Error };
    }

    // 2) user_roles (upsert)
    // Nota: la tabla usualmente permite múltiples roles por usuario, por eso usamos user_id,role.
    // Si tu tabla sólo permite 1 rol por usuario, cambia onConflict a 'user_id'.
    const { error: roleErr } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role },
        { onConflict: 'user_id,role' }
      );

    if (roleErr) {
      return { error: roleErr as unknown as Error };
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

  const hasRole = (role: AppRole) => roles.includes(role);

  const isAdmin = useMemo(
    () => roles.includes('super_admin') || roles.includes('directivo'),
    [roles]
  );

  const isStaff = useMemo(
    () => isAdmin || roles.includes('administrativo'),
    [roles, isAdmin]
  );

  const value: AuthContextType = {
    user,
    session,
    profile,
    roles,
    isLoading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
