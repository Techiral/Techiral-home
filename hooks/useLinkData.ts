import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  order: number;
}

export const useLinkData = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        
        setLinks(data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  return { links, loading, error };
};
