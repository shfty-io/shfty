import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Streaming endpoint for text enhancement with Gemini
export async function POST(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service configuration error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { text, type, maxLength = 5000 } = await request.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt based on text type
    let prompt = '';
    if (type === 'short') {
      prompt = `Create a compelling product pitch that's between 100-150 characters in length (aim for around 120-130 characters). Make it engaging and descriptive while still being concise. IMPORTANT: Respond ONLY with the final text, no explanations or commentary. Input: "${text}"`;
    } else if (type === 'full') {
      prompt = `Rewrite this into a detailed product description between 2000-5000 characters. Highlight key features, benefits, and unique selling points. Create a comprehensive but engaging description that sells the product. IMPORTANT: Respond ONLY with the final text, no explanations or commentary. Input: "${text}"`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid text type' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up the response stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Start the stream processing in the background
    (async () => {
      try {
        let accumulatedText = '';
        
        // Call the model with streaming enabled
        const streamingResult = await model.generateContentStream({
          contents: [
            { 
              role: "user", 
              parts: [{ 
                text: `As a professional copywriter specializing in product descriptions: ${prompt}` 
              }] 
            }
          ],
          generationConfig: {
            temperature: 0.8, // Slightly lower temperature for more focused outputs
            topP: 0.95,
            topK: 40,
            maxOutputTokens: Math.min(8192, maxLength * 2),
            responseMimeType: "text/plain",
          },
        });

        // Process each chunk as it arrives
        for await (const chunk of streamingResult.stream) {
          const textChunk = chunk.text();
          if (textChunk) {
            accumulatedText += textChunk;
            // Send the chunk to the client
            writer.write(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: textChunk })}\n\n`));
          }
        }
        
        // Send complete event with the full accumulated text
        writer.write(encoder.encode(`event: complete\ndata: ${JSON.stringify({ text: accumulatedText })}\n\n`));
        writer.close();
      } catch (error) {
        console.error('Error in streaming AI content:', error);
        writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Error processing AI response' })}\n\n`));
        writer.close();
      }
    })().catch(error => {
      console.error('Unhandled promise rejection in stream processing:', error);
      writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Internal server error during streaming' })}\n\n`));
      writer.close();
    });

    // Return the stream response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in enhance-text streaming API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 