import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Sparkles, Loader2, Info, X } from 'lucide-react';
import { SearchParams, getCoverage, CoverageItem } from '../lib/api';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [docType, setDocType] = useState<'cases' | 'laws'>('cases');
  const [searchType, setSearchType] = useState<'full_text' | 'name'>('full_text');
  const [searchLanguage, setSearchLanguage] = useState<'en' | 'fr'>('en');
  const [sortResults, setSortResults] = useState<'default' | 'newest_first' | 'oldest_first'>('default');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [useNlp, setUseNlp] = useState(true);
  
  const [availableDatasets, setAvailableDatasets] = useState<CoverageItem[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function loadDatasets() {
      setIsLoadingDatasets(true);
      try {
        const response = await getCoverage(docType);
        if (response && response.results) {
          setAvailableDatasets(response.results);
        } else {
          setAvailableDatasets([]);
        }
      } catch (err) {
        console.error('Failed to load datasets', err);
        setAvailableDatasets([]);
      } finally {
        setIsLoadingDatasets(false);
      }
    }
    
    loadDatasets();
    setSelectedDatasets([]); // Reset selected datasets when docType changes
  }, [docType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch({
      query,
      doc_type: docType,
      search_type: searchType,
      search_language: searchLanguage,
      sort_results: sortResults,
      dataset: selectedDatasets.length > 0 ? selectedDatasets.join(',') : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      use_nlp: useNlp,
    });
  };

  const toggleDataset = (datasetCode: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetCode) 
        ? prev.filter(d => d !== datasetCode)
        : [...prev, datasetCode]
    );
  };

  return (
    <div className="space-y-4 mb-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-4 mb-4 relative z-10">
          <div className={`flex-1 relative transition-all duration-300 ${useNlp ? 'ring-2 ring-indigo-500/20 rounded-xl' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors ${useNlp ? 'text-indigo-500' : 'text-slate-400'}`} />
            </div>
            <input
              type="text"
              className={`block w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all ${
                useNlp ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-300'
              }`}
              placeholder='Enter legal query or boolean terms (e.g. "wrongful dismissal" AND Ontario)...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className={`p-1.5 rounded-lg transition-colors ${showTips ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Boolean Search Tips"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search All'
            )}
          </button>
        </div>

        {showTips && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center">
                <Info className="h-4 w-4 mr-2 text-indigo-600" />
                Boolean Search Guide
              </h4>
              <button onClick={() => setShowTips(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-700">Exact Phrase</p>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600">"wrongful dismissal"</code>
                <p className="text-slate-500">Finds exact matches only.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700">AND (Both Terms)</p>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600">contract AND breach</code>
                <p className="text-slate-500">Must contain both words.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700">OR (Either Term)</p>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600">car OR vehicle</code>
                <p className="text-slate-500">Contains at least one word.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700">NOT (Exclude)</p>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600">tort NOT negligence</code>
                <p className="text-slate-500">Excludes specific terms.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center mb-6 ml-1">
          <label className="flex items-center cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={useNlp}
                onChange={() => setUseNlp(!useNlp)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${useNlp ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useNlp ? 'transform translate-x-4 shadow-sm' : ''}`}></div>
            </div>
            <div className={`ml-3 flex items-center text-sm font-medium transition-colors ${useNlp ? 'text-indigo-700' : 'text-slate-700'} group-hover:text-indigo-600`}>
              <Sparkles className={`h-4 w-4 mr-1.5 ${useNlp ? 'text-indigo-500' : 'text-slate-400'}`} />
              AI-Enhanced Search (NLP & Boolean Optimization)
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as 'cases' | 'laws')}
              className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-colors"
            >
              <option value="cases">Case Law</option>
              <option value="laws">Statutes & Regulations</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Search Scope</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'full_text' | 'name')}
              className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-colors"
            >
              <option value="full_text">Full Text Search</option>
              <option value="name">Title / Citation Only</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
            <select
              value={searchLanguage}
              onChange={(e) => setSearchLanguage(e.target.value as 'en' | 'fr')}
              className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-colors"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sort Order</label>
            <select
              value={sortResults}
              onChange={(e) => setSortResults(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-colors"
            >
              <option value="default">Relevance (AI Ranked)</option>
              <option value="newest_first">Newest First</option>
              <option value="oldest_first">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            {showAdvanced ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Specific Datasets {selectedDatasets.length > 0 && `(${selectedDatasets.length})`}
                </label>
                <div className="border border-slate-200 rounded-xl shadow-inner bg-white h-40 overflow-y-auto p-3">
                  {isLoadingDatasets ? (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </div>
                  ) : availableDatasets.length === 0 ? (
                    <div className="text-xs text-slate-400 p-1">No datasets available</div>
                  ) : (
                    <div className="space-y-2">
                      {availableDatasets.map((ds) => (
                        <label key={ds.dataset} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedDatasets.includes(ds.dataset)}
                            onChange={() => toggleDataset(ds.dataset)}
                          />
                          <span className="text-xs text-slate-700 leading-tight">
                            <span className="font-bold group-hover:text-indigo-600 transition-colors">{ds.dataset}</span>
                            {ds.description_en && <span className="text-slate-400 block truncate mt-0.5" title={ds.description_en}> {ds.description_en}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full border-slate-200 bg-white rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full border-slate-200 bg-white rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5"
                  />
                </div>
                <div className="sm:col-span-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-700">
                    <strong>Pro Tip:</strong> Use advanced filters to narrow down results to specific courts, jurisdictions, or time periods for more relevant case law.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
