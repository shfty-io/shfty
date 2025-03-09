import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Endpoint to enhance text using Google Gemini Flash
export async function POST(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    // Parse the request body
    const { text, type, maxLength = 5000 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Create the prompt based on text type
    let prompt = '';
    if (type === 'short') {
      prompt = `Create a compelling product pitch that's between 100-150 characters in length (aim for around 120-130 characters). Make it engaging and descriptive while still being concise. IMPORTANT: Respond ONLY with the final text, no explanations or commentary. Input: "${text}"`;
    } else if (type === 'full') {
      prompt = `Rewrite this into a detailed product description between 2000-5000 characters. Highlight key features, benefits, and unique selling points. Create a comprehensive but engaging description that sells the product. IMPORTANT: Respond ONLY with the final text, no explanations or commentary. Input: "${text}"`;
    } else {
      return NextResponse.json(
        { error: 'Invalid text type' },
        { status: 400 }
      );
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // For text-only input, use the gemini-2.0-flash-lite model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Call the model with the text prompt
    const result = await model.generateContent({
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

    const response = result.response;
    const enhancedText = response.text();

    if (!enhancedText) {
      return NextResponse.json(
        { error: 'Failed to generate enhanced text' },
        { status: 500 }
      );
    }

    // Format the response based on text type
    if (type === 'full') {
      // For full descriptions, return the text as is - we'll handle formatting in the frontend
      return NextResponse.json({ enhancedText });
    }

    return NextResponse.json({ enhancedText });

  } catch (error) {
    console.error('Error in enhance-text API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 