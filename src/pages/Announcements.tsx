import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Announcements() {
  const { profile, roles } = useAuth();
  const queryClient = useQueryClient();

  const canPost =
    roles.includes('super_admin') ||
    roles.includes('directivo') ||
    roles.includes('administrativo') ||
    roles.includes('profesor');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<'profesor' | 'alumno' | 'padre' | ''>('');
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['announcements', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('school_id', profile?.school_id ?? '')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  const createAnnouncement = async () => {
    if (!profile?.school_id || !profile?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('announcements').insert({
        school_id: profile.school_id,
        author_profile_id: profile.id,
        title,
        content,
        target_role: targetRole || null,
        is_published: true,
      });

      if (error) throw error;

      setTitle('');
      setContent('');
      setTargetRole('');
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['announcements', profile.school_id] });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Anuncios</h1>

      {canPost && (
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>Nuevo anuncio</Button>
        </div>
      )}

      {isLoading ? (
        <p>Cargando anuncios...</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar anuncios</p>
      ) : (
        <div className="grid gap-4">
          {(data ?? []).map((announcement: any) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{announcement.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {announcement.target_role ? `Dirigido a: ${announcement.target_role}` : 'General'}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-gray-700">
                {announcement.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg space-y-4">
            <h2 className="text-xl font-semibold">Nuevo anuncio</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contenido</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[140px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirigido a</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
              >
                <option value="">General</option>
                <option value="profesor">Profesores</option>
                <option value="alumno">Alumnos</option>
                <option value="padre">Padres</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createAnnouncement} disabled={saving || !title || !content}>
                {saving ? 'Guardando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
