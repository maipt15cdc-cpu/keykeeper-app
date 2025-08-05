import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Export commonly used types
export type { User, Session } from '@supabase/supabase-js';