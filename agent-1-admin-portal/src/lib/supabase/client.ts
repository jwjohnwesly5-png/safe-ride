import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oygrlwueaogknvgkycvy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Z3Jsd3VlYW9na252Z2t5Y3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODEzMDMsImV4cCI6MjEwNzE1NzMwM30.FqRFifcdBeaf8KlqiRJNN34PDXq4Y-v24OYjWPnwq60'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
