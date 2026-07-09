export default function Footer() {
  return (
    <footer className="border-t py-8 px-6" style={{ borderColor: 'rgba(42,0,82,0.5)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(109,40,217,0.4)' }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <ellipse cx="10" cy="10" rx="9" ry="6" stroke="#a78bfa" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3.5" fill="#6d28d9" />
              <circle cx="10" cy="10" r="1.8" fill="#22d3ee" />
            </svg>
          </div>
          <span className="text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            Ey<span style={{ color: '#8b5cf6' }}>Studio</span>
          </span>
          <span className="text-rb-light/20 text-xs hidden sm:block">· Roblox Development Studio</span>
        </div>

        <div className="flex items-center gap-5 text-xs text-rb-light/30">
          {['Games', 'Services', 'Team', 'Kontakt'].map((l) => (
            <a key={l} href={l === 'Kontakt' ? '#contact' : `#${l.toLowerCase()}`}
              className="hover:text-rb-light transition-colors">{l}</a>
          ))}
        </div>

        <p className="text-rb-light/20 text-xs">© {new Date().getFullYear()} EyStudio</p>
      </div>
    </footer>
  )
}
