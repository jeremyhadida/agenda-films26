export function Footer() {
  return (
    <footer className="bg-surface-low mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <span className="font-display font-bold text-gold text-sm">FILMS 26</span>
        <span className="text-muted text-xs font-body">
          © {new Date().getFullYear()} Metropolitan Filmexport
        </span>
      </div>
    </footer>
  )
}
