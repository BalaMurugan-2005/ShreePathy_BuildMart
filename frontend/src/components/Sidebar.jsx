// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ links }) {
  const location = useLocation()

  return (
    <aside className="bg-brand-black w-64 min-h-screen flex flex-col py-6 px-3 gap-1 shrink-0">
      {links.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to
        return (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
