import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY environment variable' },
        { status: 500 }
      );
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with a simple model call
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello, world!" }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 100,
      },
    });

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      message: "Google AI SDK is working correctly",
      response: text
    });
  } catch (error) {
    console.error('Error testing Google AI SDK:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        errorObject: JSON.stringify(error)
      },
      { status: 500 }
    );
  }
} 