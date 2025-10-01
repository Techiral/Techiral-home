import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwihntvbkarkwgqoafnr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aWhudHZia2Fya3dncW9hZm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTA4MTAsImV4cCI6MjA3NDg4NjgxMH0.oKHsUj2tVDi-uYi9SrldtbXd3ZUCuTtdRxFbIY2tNIA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
