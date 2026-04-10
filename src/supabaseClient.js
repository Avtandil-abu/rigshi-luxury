import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnnheqfvlysczcudecnt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubmhlcWZ2bHlzY3pjdWRlY250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDg3ODEsImV4cCI6MjA5MTM4NDc4MX0.btRtPPTSuaQ_NK4hZa5Z-v1YOYvGqiz4GeFbqWPwjE8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)