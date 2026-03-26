import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import {
  useSeriesList,
  useArchiveSeries,
  useUnarchiveSeries,
  usePublishSeries,
  useUnpublishSeries,
  useDeleteSeries,
} from '../api/series';
import type { Series } from '../types/api.types';

export function SeriesListPage() {
  const [filters, setFilters] = useState({
    query: '',
    visibility: '',
    source: '',
    page: 1,
  });

  const { data, isLoading, refetch } = useSeriesList(filters);
  const archiveMutation = useArchiveSeries();
  const unarchiveMutation = useUnarchiveSeries();
  const publishMutation = usePublishSeries();
  const unpublishMutation = useUnpublishSeries();
  const deleteMutation = useDeleteSeries();

  const handleAction = async (action: string, id: string) => {
    if (action === 'delete' && !confirm('Tem certeza que deseja deletar? Esta ação é irreversível.')) {
      return;
    }

    try {
      switch (action) {
        case 'archive':
          await archiveMutation.mutateAsync(id);
          break;
        case 'unarchive':
          await unarchiveMutation.mutateAsync(id);
          break;
        case 'publish':
          await publishMutation.mutateAsync(id);
          break;
        case 'unpublish':
          await unpublishMutation.mutateAsync(id);
          break;
        case 'delete':
          await deleteMutation.mutateAsync(id);
          break;
      }
      refetch();
    } catch (error) {
      console.error(`Erro ao ${action}:`, error);
      alert(`Erro ao ${action} série`);
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const colors = {
      published: 'bg-green-600',
      draft: 'bg-yellow-600',
      archived: 'bg-red-600',
    };
    return colors[visibility as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Séries</h2>
          <Link
            to="/admin/series/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            ➕ Nova Série
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value, page: 1 })}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={filters.visibility}
              onChange={(e) => setFilters({ ...filters, visibility: e.target.value, page: 1 })}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas visibilidades</option>
              <option value="published">Publicadas</option>
              <option value="draft">Rascunhos</option>
              <option value="archived">Arquivadas</option>
            </select>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value, page: 1 })}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas fontes</option>
              <option value="tmdb">TMDB</option>
              <option value="manual">Manual</option>
            </select>
            <button
              onClick={() => setFilters({ query: '', visibility: '', source: '', page: 1 })}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Carregando...</div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhuma série encontrada</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fonte
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Destaque
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {data.items.map((series: Series) => (
                      <tr key={series.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {series.titleOverride || series.title}
                            </p>
                            {series.originalTitle && (
                              <p className="text-sm text-gray-400">{series.originalTitle}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                            {series.source}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded text-white ${getVisibilityBadge(series.visibility)}`}
                          >
                            {series.visibility}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {series.isFeatured ? (
                            <span className="text-xs px-2 py-1 bg-purple-600 rounded text-white">
                              ⭐ {series.featuredOrder || '–'}
                            </span>
                          ) : (
                            <span className="text-gray-500">–</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/series/${series.id}`}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Editar
                            </Link>
                            {series.visibility === 'archived' ? (
                              <button
                                onClick={() => handleAction('unarchive', series.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                              >
                                Desarquivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction('archive', series.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                              >
                                Arquivar
                              </button>
                            )}
                            {series.visibility === 'published' ? (
                              <button
                                onClick={() => handleAction('unpublish', series.id)}
                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                              >
                                Despublicar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction('publish', series.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                              >
                                Publicar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-900 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page >= data.pagination.totalPages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
