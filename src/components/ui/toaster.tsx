import { Toast, ToastProvider } from '@/components/ui/toast'

export function Toaster() {
  return (
    <ToastProvider>
      <Toast />
    </ToastProvider>
  )
} 