import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupCommand = `cd /home/aryan/Desktop/Minecraft && tar -czf backups/backup-${timestamp}.tar.gz world`
    
    // Insert command into the queue
    const { error } = await supabase
      .from('server_commands')
      .insert({
        command: backupCommand,
        type: 'backup',
        status: 'pending'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup command queued successfully',
        timestamp,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}) 