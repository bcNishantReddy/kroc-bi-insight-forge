
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, csvData, bundleInfo } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get user settings to determine which AI model to use
    const { data: settings } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const preferredModel = settings?.preferred_ai_model || 'gemini'

    let aiResponse = ''

    if (preferredModel === 'openai' && settings?.openai_key) {
      // Use OpenAI
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openai_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.preferred_openai_model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a data analysis expert. You are analyzing a CSV dataset called "${bundleInfo.name}" with ${bundleInfo.totalRows} rows and the following columns: ${bundleInfo.columns.join(', ')}. 

The user has provided you with the complete dataset. Analyze the data and provide insights, statistics, patterns, and answer questions about the data. Be specific and reference actual values from the data when possible.

Here is the complete CSV data:
${JSON.stringify(csvData.slice(0, 1000))}${csvData.length > 1000 ? '\n... (showing first 1000 rows of ' + csvData.length + ' total rows)' : ''}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      })

      if (!openaiResponse.ok) {
        throw new Error('OpenAI API error')
      }

      const openaiData = await openaiResponse.json()
      aiResponse = openaiData.choices[0].message.content
    } else {
      // Use Google Gemini (default)
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured')
      }

      const prompt = `You are a data analysis expert. You are analyzing a CSV dataset called "${bundleInfo.name}" with ${bundleInfo.totalRows} rows and the following columns: ${bundleInfo.columns.join(', ')}.

The user has provided you with the complete dataset. Analyze the data and provide insights, statistics, patterns, and answer questions about the data. Be specific and reference actual values from the data when possible.

Here is the complete CSV data:
${JSON.stringify(csvData.slice(0, 1000))}${csvData.length > 1000 ? '\n... (showing first 1000 rows of ' + csvData.length + ' total rows)' : ''}

User question: ${message}

Please provide a helpful, detailed analysis based on the actual data provided.`

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error('Gemini API error:', errorText)
        throw new Error('Gemini API error: ' + errorText)
      }

      const geminiData = await geminiResponse.json()
      aiResponse = geminiData.candidates[0].content.parts[0].text
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in gemini-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
