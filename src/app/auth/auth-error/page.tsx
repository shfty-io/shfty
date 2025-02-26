import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="font-medium">shifty</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-balance text-sm text-muted-foreground">
            There was a problem authenticating your account. Please try again.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 