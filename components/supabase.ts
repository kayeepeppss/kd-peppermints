import { createClient } from '@supabase/supabase-js'

// 1. This is your Project URL (Notice it stops at .co)
const supabaseUrl = 'https://lqoaopxfdpohlyhgejmk.supabase.co'

// 2. This is your API Key
const supabaseKey = 'sb_publishable_0yRQXQC9J69KKFNH9M6iQQ_SNmp6s4w'

// 3. This connects them
export const supabase = createClient(supabaseUrl, supabaseKey)