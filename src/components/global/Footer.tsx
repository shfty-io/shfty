import Link from 'next/link';

export function Footer() {
  return (
    <div className="pt-16 mt-auto">
      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Software Marketplace. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:underline hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/terms" className="hover:underline hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 