import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import {
  useSeries,
  useUpdateSeries,
  useSyncSeries,
  usePublishSeries,
  useUnpublishSeries,
  useArchiveSeries,
  useUnarchiveSeries,
  useDeleteSeries,
} from '../api/series';
import { updateSeriesSchema, type UpdateSeriesInput } from '../schemas/series.schemas';

export function SeriesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: series, isLoading } = useSeries(id!);
  const updateMutation = useUpdateSeries(id!);
  const syncMutation = useSyncSeries();
  const publishMutation = usePublishSeries();
  const unpublishMutation = useUnpublishSeries();
  const archiveMutation = useArchiveSeries();
  const unarchiveMutation = useUnarchiveSeries();
  const deleteMutation = useDeleteSeries();

  const form = useForm<UpdateSeriesInput>({
    resolver: zodResolver(updateSeriesSchema),
    values: series
      ? {
          titleOverride: series.titleOverride || '',
          overviewOverride: series.overviewOverride || '',
          tagsJson: series.tagsJson || '',
          visibility: series.visibility,
          isFeatured: series.isFeatured,
          featuredOrder: series.featuredOrder,
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateSeriesInput) => {
    try {
      await updateMutation.mutateAsync(data);
      alert('Série atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar série');
    }
  };

  const handleSync = async () => {
    if (!confirm('Sincronizar dados do TMDB? Overrides locais serão preservados.')) return;
    try {
      await syncMutation.mutateAsync(id!);
      alert('Série sincronizada com sucesso!');
    } catch (error) {
      alert('Erro ao sincronizar série');
    }
  };

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'publish':
          await publishMutation.mutateAsync(id!);
          break;
        case 'unpublish':
          await unpublishMutation.mutateAsync(id!);
          break;
        case 'archive':
          if (!confirm('Arquivar esta série?')) return;
          await archiveMutation.mutateAsync(id!);
          break;
        case 'unarchive':
          await unarchiveMutation.mutateAsync(id!);
          break;
        case 'delete':
          if (!confirm('DELETAR permanentemente? Esta ação é IRREVERSÍVEL!')) return;
          await deleteMutation.mutateAsync(id!);
          navigate('/admin/series');
          return;
      }
      alert('Ação executada com sucesso!');
    } catch (error) {
      alert(`Erro ao executar ação: ${action}`);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      </AdminLayout>
    );
  }

  if (!series) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-red-400">Série não encontrada</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Editar Série</h2>
          <button
            onClick={() => navigate('/admin/series')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Dados TMDB (Readonly) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            📡 Dados do TMDB (Somente Leitura)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4 col-span-2">
              {series.posterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w185${series.posterPath}`}
                  alt={series.title}
                  className="w-32 h-48 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-400">Título</p>
                <p className="text-white font-medium">{series.title}</p>

                {series.originalTitle && (
                  <>
                    <p className="text-sm text-gray-400 mt-2">Título Original</p>
                    <p className="text-white">{series.originalTitle}</p>
                  </>
                )}

                <p className="text-sm text-gray-400 mt-2">Fonte</p>
                <p className="text-white">
                  {series.source === 'tmdb' ? `TMDB (ID: ${series.tmdbId})` : 'Manual'}
                </p>
              </div>
            </div>

            {series.overview && (
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Sinopse (TMDB)</p>
                <p className="text-white text-sm">{series.overview}</p>
              </div>
            )}
          </div>

          {series.source === 'tmdb' && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {syncMutation.isPending ? 'Sincronizando...' : '🔄 Sincronizar do TMDB'}
            </button>
          )}
        </div>

        {/* Overrides Locais (Editáveis) */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">✏️ Overrides Locais</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título Personalizado (Override)
              </label>
              <input
                {...form.register('titleOverride')}
                placeholder="Deixe vazio para usar o título do TMDB"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Será usado no site: {series.titleOverride || series.title}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sinopse PT-BR (Override)
              </label>
              <textarea
                {...form.register('overviewOverride')}
                rows={4}
                placeholder="Sinopse traduzida ou personalizada em português"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (JSON Array)
              </label>
              <input
                {...form.register('tagsJson')}
                placeholder='["ação", "aventura", "shonen"]'
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Controle de Visibilidade e Destaque */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">⚙️ Controles</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visibilidade
              </label>
              <select
                {...form.register('visibility')}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" {...form.register('isFeatured')} className="w-4 h-4" />
              <label className="text-sm text-gray-300">⭐ Marcar como destaque</label>
            </div>

            {form.watch('isFeatured') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ordem do Destaque
                </label>
                <input
                  type="number"
                  {...form.register('featuredOrder')}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Menor número = maior prioridade
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {updateMutation.isPending ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>

            {series.visibility !== 'published' ? (
              <button
                type="button"
                onClick={() => handleAction('publish')}
                disabled={publishMutation.isPending}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                ✅ Publicar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction('unpublish')}
                disabled={unpublishMutation.isPending}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                ⏸️ Despublicar
              </button>
            )}

            {series.visibility !== 'archived' ? (
              <button
                type="button"
                onClick={() => handleAction('archive')}
                disabled={archiveMutation.isPending}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                🗑️ Arquivar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction('unarchive')}
                disabled={unarchiveMutation.isPending}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                ♻️ Desarquivar
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAction('delete')}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 bg-gray-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors"
            >
              ⚠️ Deletar Permanentemente
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
