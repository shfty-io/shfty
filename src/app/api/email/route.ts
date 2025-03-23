import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendEmail, sendWelcomeEmail } from '@/lib/email'
import { createServiceClient } from '@/lib/server'

// Only allow POST requests to this endpoint
export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client for auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )
    
    // Create service client for database operations
    const serviceClient = createServiceClient();

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type or data' },
        { status: 400 }
      )
    }

    // Handle different email types
    switch (type) {
      case 'welcome':
        // Verify user has admin role or is sending to themselves
        if (data.email !== session.user.email) {
          const { data: userRole } = await serviceClient
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          
          if (userRole?.role !== 'admin') {
            return NextResponse.json(
              { error: 'Unauthorized to send emails to other users' },
              { status: 403 }
            )
          }
        }

        const result = await sendWelcomeEmail({
          name: data.name,
          email: data.email,
        })
        
        return NextResponse.json({ success: result.success })
      
      case 'custom':
        // Verify user has admin role
        const { data: userRole } = await serviceClient
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
        
        if (userRole?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Unauthorized to send custom emails' },
            { status: 403 }
          )
        }

        // Send custom email
        const emailResult = await sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
        })
        
        return NextResponse.json({ success: emailResult.success })
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 