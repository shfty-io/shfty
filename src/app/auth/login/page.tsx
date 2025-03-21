'use client';

import { LoginForm } from "@/components/auth/LoginForm"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] justify-center items-center">
      <div className="w-full max-w-md p-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 