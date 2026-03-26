import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { useSeriesStats, useAuditLogs } from '../api/series';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSeriesStats();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs(10);

  const statCards = [
    { label: 'Total', value: stats?.total || 0, color: 'bg-blue-600' },
    { label: 'Publicadas', value: stats?.published || 0, color: 'bg-green-600' },
    { label: 'Rascunhos', value: stats?.draft || 0, color: 'bg-yellow-600' },
    { label: 'Arquivadas', value: stats?.archived || 0, color: 'bg-red-600' },
    { label: 'Em Destaque', value: stats?.featured || 0, color: 'bg-purple-600' },
  ];

  const actionLabels: Record<string, string> = {
    create: 'Criou',
    import: 'Importou',
    update: 'Atualizou',
    archive: 'Arquivou',
    unarchive: 'Desarquivou',
    publish: 'Publicou',
    unpublish: 'Despublicou',
    sync: 'Sincronizou',
    delete: 'Deletou',
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsLoading ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              Carregando estatísticas...
            </div>
          ) : (
            statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
              >
                <div className={`inline-block px-3 py-1 ${stat.color} rounded-md mb-3`}>
                  <span className="text-sm font-medium text-white">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="flex gap-4">
            <Link
              to="/admin/series/new"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Nova Série
            </Link>
            <Link
              to="/admin/series"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              📺 Ver Todas
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
          {auditLoading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <p className="text-gray-400">Nenhuma atividade registrada</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-white">
                      <strong>{log.user.email}</strong> {actionLabels[log.action] || log.action}{' '}
                      {log.entity}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
