// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400'
}

// Initialize Supabase client with direct values for testing
const supabase = createClient(
  'https://akyzhmdbbrqkzghwibov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreXpobWRiYnJxa3pnaHdpYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzUxMzksImV4cCI6MjA1NzA1MTEzOX0.2WiX2RLgdNwFaX99MpPViBGNy-DCTXr-iWXrYzItrXs'
)

console.log("Hello from Functions!")

serve(async (req: Request) => {
  console.log(`Received ${req.method} request`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  }

  try {
    console.log('Preparing to insert command into queue')
    
    const startCommand = 'docker run -it --rm -v /home/aryan/Desktop/Minecraft:/minecraft -w /minecraft -p 25565:25565 openjdk:21 java -Xmx2G -Xms2G -jar 1-21-4-fab.jar'
    
    console.log('Using command:', startCommand)

    // Insert command into the queue
    const { data, error } = await supabase
      .from('server_commands')
      .insert({
        command: startCommand,
        type: 'start',
        status: 'pending'
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Command inserted successfully:', data)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Start server command queued successfully',
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Error in start-server function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/start-server' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
