import { Link, useLocation } from 'react-router-dom';
import { useMe } from '../api/auth';
import { logout } from '../api/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { data: user } = useMe();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/series', label: 'Séries', icon: '📺' },
    { path: '/admin/series/new', label: '+ Nova Série', icon: '➕' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-[250px] bg-gray-900 border-r border-gray-800 p-6 fixed h-screen overflow-y-auto">
        <Link to="/admin" className="text-2xl font-bold text-purple-500 mb-8 block">
          Miyache Admin
        </Link>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 rounded-md transition-all duration-200 flex items-center gap-4 ${
                location.pathname === item.path
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-[250px] flex-1 p-8 w-[calc(100%-250px)]">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span>{user?.email}</span>
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">{user?.role}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white cursor-pointer transition-all duration-200 hover:bg-gray-700"
            >
              Sair
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
