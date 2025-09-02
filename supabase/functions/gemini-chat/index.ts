
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

    // Optimize data for API limits - sample data intelligently
    const sampleSize = Math.min(50, csvData.length) // Max 50 rows
    const sampledData = csvData.length > sampleSize 
      ? csvData.slice(0, Math.floor(sampleSize/2))
          .concat(csvData.slice(-Math.floor(sampleSize/2))) // First and last rows
      : csvData

    // Create data summary for context
    const dataSummary = {
      totalRows: csvData.length,
      columns: Object.keys(csvData[0] || {}),
      sampleRows: sampledData.length,
      dataTypes: Object.keys(csvData[0] || {}).reduce((acc, key) => {
        const sampleValues = csvData.slice(0, 10).map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '')
        acc[key] = typeof sampleValues[0]
        return acc
      }, {} as Record<string, string>)
    }

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
              content: `You are a data analysis expert. You are analyzing a CSV dataset called "${bundleInfo.name}" with ${dataSummary.totalRows} total rows and ${dataSummary.columns.length} columns.

DATASET OVERVIEW:
- Total rows: ${dataSummary.totalRows}
- Columns: ${dataSummary.columns.join(', ')}
- Data types: ${JSON.stringify(dataSummary.dataTypes, null, 2)}

SAMPLE DATA (${dataSummary.sampleRows} representative rows from ${dataSummary.totalRows} total):
${JSON.stringify(sampledData, null, 2)}

Analyze this data and provide insights. When referencing statistics, extrapolate from the sample to the full dataset size of ${dataSummary.totalRows} rows.`
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

      const prompt = `You are a data analysis expert. You are analyzing a CSV dataset called "${bundleInfo.name}" with ${dataSummary.totalRows} total rows and ${dataSummary.columns.length} columns.

DATASET OVERVIEW:
- Total rows: ${dataSummary.totalRows}
- Columns: ${dataSummary.columns.join(', ')}
- Data types: ${JSON.stringify(dataSummary.dataTypes, null, 2)}

SAMPLE DATA (${dataSummary.sampleRows} representative rows from ${dataSummary.totalRows} total):
${JSON.stringify(sampledData, null, 2)}

User question: ${message}

Please analyze this sample data and provide insights that can be extrapolated to the full dataset of ${dataSummary.totalRows} rows. Be specific about patterns, statistics, and trends you observe.`

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
        
        // Handle quota exceeded error specifically
        if (errorText.includes('429') || errorText.includes('quota')) {
          throw new Error('AI service temporarily unavailable due to high usage. Please try again in a few moments.')
        }
        
        throw new Error('AI service error: ' + errorText)
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
