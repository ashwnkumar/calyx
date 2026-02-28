import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="w-full border-t border-t-foreground/10 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2026 Calyx</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs">Zero-knowledge secrets manager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com/ashwnkumar/calyx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
