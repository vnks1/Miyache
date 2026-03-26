import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { useCreateSeries } from '../api/series';
import { useTmdbSearch } from '../api/tmdb';
import {
  createSeriesManualSchema,
  createSeriesFromTmdbSchema,
  type CreateSeriesInput,
} from '../schemas/series.schemas';
import type { TmdbShow } from '../types/api.types';

export function SeriesCreatePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'manual' | 'tmdb'>('tmdb');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTmdb, setSelectedTmdb] = useState<TmdbShow | null>(null);

  const createMutation = useCreateSeries();
  const { data: tmdbResults, isLoading: searchLoading } = useTmdbSearch(searchQuery);

  // Form para criação manual
  const manualForm = useForm({
    resolver: zodResolver(createSeriesManualSchema),
    defaultValues: {
      source: 'manual' as const,
      title: '',
      visibility: 'draft' as const,
      isFeatured: false,
    },
  });

  // Form para import TMDB
  const tmdbForm = useForm({
    resolver: zodResolver(createSeriesFromTmdbSchema),
    defaultValues: {
      source: 'tmdb' as const,
      tmdbId: 0,
      visibility: 'draft' as const,
      isFeatured: false,
    },
  });

  const onManualSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data as CreateSeriesInput);
      navigate('/admin/series');
    } catch (error) {
      console.error('Erro ao criar série:', error);
    }
  };

  const onTmdbSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data as CreateSeriesInput);
      navigate('/admin/series');
    } catch (error) {
      console.error('Erro ao importar série:', error);
    }
  };

  const handleSelectTmdb = (show: TmdbShow) => {
    setSelectedTmdb(show);
    tmdbForm.setValue('tmdbId', show.id);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Nova Série</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setTab('tmdb')}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'tmdb'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Importar do TMDB
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'manual'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Criar Manualmente
          </button>
        </div>

        {/* Tab: Import TMDB */}
        {tab === 'tmdb' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar Anime no TMDB
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do anime..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {searchLoading && <p className="mt-4 text-gray-400">Buscando...</p>}

              {tmdbResults && tmdbResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {tmdbResults.map((show) => (
                    <div
                      key={show.id}
                      onClick={() => handleSelectTmdb(show)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedTmdb?.id === show.id
                          ? 'bg-purple-600'
                          : 'bg-gray-900 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex gap-4">
                        {show.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                            alt={show.name}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-white">{show.name}</h3>
                          <p className="text-sm text-gray-400">{show.original_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            TMDB ID: {show.id} • {show.first_air_date || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTmdb && (
              <form onSubmit={tmdbForm.handleSubmit(onTmdbSubmit)} className="space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Selecionado</h3>
                  <div className="flex gap-4 mb-4">
                    {selectedTmdb.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${selectedTmdb.poster_path}`}
                        alt={selectedTmdb.name}
                        className="w-32 h-48 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-white text-xl">{selectedTmdb.name}</h4>
                      <p className="text-gray-400">{selectedTmdb.original_name}</p>
                      <p className="text-sm text-gray-500 mt-2">{selectedTmdb.overview}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Visibilidade
                      </label>
                      <select
                        {...tmdbForm.register('visibility')}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...tmdbForm.register('isFeatured')}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-300">Marcar como destaque</label>
                    </div>

                    {tmdbForm.watch('isFeatured') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ordem do Destaque
                        </label>
                        <input
                          type="number"
                          {...tmdbForm.register('featuredOrder')}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {createMutation.isPending ? 'Importando...' : 'Importar Série'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/series')}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab: Manual */}
        {tab === 'manual' && (
          <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  {...manualForm.register('title')}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {manualForm.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {manualForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título Original
                </label>
                <input
                  {...manualForm.register('originalTitle')}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sinopse
                </label>
                <textarea
                  {...manualForm.register('overview')}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibilidade
                </label>
                <select
                  {...manualForm.register('visibility')}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...manualForm.register('isFeatured')}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-300">Marcar como destaque</label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Série'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/series')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
