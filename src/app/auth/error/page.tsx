'use client'

import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  )
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('error') || 'Unknown authentication error'
  
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-[450px] flex-col items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="font-medium">marketplace</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <div className="mt-4 rounded-md bg-amber-50 p-4 text-left text-sm text-amber-800">
            <p>The authentication process failed. This may be due to:</p>
            <ul className="ml-4 mt-2 list-disc">
              <li>Session token issues</li>
              <li>CSRF validation errors</li>
              <li>OAuth provider issues</li>
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try logging in again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function AuthErrorLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-[450px] flex-col items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="font-medium">marketplace</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Please wait while we retrieve error details
          </p>
        </div>
      </div>
    </div>
  )
} 