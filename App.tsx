import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { DocumentViewer } from './components/DocumentViewer';
import { CoverageTable } from './components/CoverageTable';
import { CanLIIViewer } from './components/CanLIIViewer';
import { TLADatabases } from './components/TLADatabases';
import { searchLegalData, SearchParams, SearchResultItem } from './lib/api';
import { analyzeQuery, NlpAnalysis, scoreAndSummarizeResults, searchExternalSites } from './lib/nlp';
import { Scale, Database, Search, AlertCircle, ExternalLink, Library, Sparkles, ChevronLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'coverage' | 'canlii' | 'tla'>('search');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [nlpData, setNlpData] = useState<NlpAnalysis | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  
  const [selectedDocument, setSelectedDocument] = useState<{ citation: string; docType: 'cases' | 'laws'; url_en?: string; url_fr?: string } | null>(null);
  const [currentDocType, setCurrentDocType] = useState<'cases' | 'laws'>('cases');
  const [canliiUrl, setCanliiUrl] = useState<string>('https://www.canlii.org/en/');

  const tabs = [
    { id: 'search', label: 'Legal Search', icon: Search },
    { id: 'coverage', label: 'Database Coverage', icon: Database },
    { id: 'canlii', label: 'CanLII Browser', icon: Library },
    { id: 'tla', label: 'External Resources', icon: ExternalLink },
  ] as const;

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setCurrentDocType(params.doc_type || 'cases');
    setLastQuery(params.query);
    setNlpData(null);
    setIsScoring(false);
    
    try {
      let finalQuery = params.query;
      
      // Apply NLP enhancement if requested
      if (params.use_nlp) {
        const analysis = await analyzeQuery(params.query);
        setNlpData(analysis);
        finalQuery = analysis.optimizedQuery;
      }

      // Search both databases concurrently
      const enhancedParams = { ...params, query: finalQuery };
      const { searchONLegis } = await import('./lib/api');
      
      const [a2ajResponse, onLegisResponse, webResponse] = await Promise.allSettled([
        searchLegalData(enhancedParams),
        searchONLegis(finalQuery),
        params.use_nlp ? searchExternalSites(finalQuery) : Promise.resolve([])
      ]);

      let combinedResults: SearchResultItem[] = [];
      
      if (a2ajResponse.status === 'fulfilled' && a2ajResponse.value && a2ajResponse.value.results) {
        combinedResults = [...combinedResults, ...a2ajResponse.value.results];
      }
      
      if (onLegisResponse.status === 'fulfilled' && onLegisResponse.value && onLegisResponse.value.results && onLegisResponse.value.results.results) {
        const onLegisMapped = onLegisResponse.value.results.results.map((r: any) => ({
          id: String(r.documentId),
          citation: r.labelAndTitle,
          title_en: r.documentTitle,
          dataset: 'ONLegis',
          snippet: r.snippet,
          url_en: `https://www.ontario.ca/laws/statute/${r.documentProductNumber.toLowerCase()}`
        }));
        combinedResults = [...combinedResults, ...onLegisMapped];
      }

      if (webResponse.status === 'fulfilled' && Array.isArray(webResponse.value)) {
        combinedResults = [...combinedResults, ...webResponse.value];
      }

      if (combinedResults.length === 0) {
        setSearchResults([]);
        return;
      }

      setSearchResults(combinedResults);

      // Perform scoring and summarization if NLP is enabled
      if (params.use_nlp && combinedResults.length > 0) {
        setIsScoring(true);
        try {
          const scoredDict = await scoreAndSummarizeResults(params.query, combinedResults);
          
          setSearchResults(prev => prev.map(result => {
            const id = result.citation || result.id || 'unknown';
            if (scoredDict[id]) {
              return {
                ...result,
                alignmentScore: scoredDict[id].score,
                aiSummary: scoredDict[id].summary
              };
            }
            return result;
          }).sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0)));
        } finally {
          setIsScoring(false);
        }
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewOnCanLII = (url: string) => {
    setCanliiUrl(url);
    setActiveTab('canlii');
    setSelectedDocument(null);
  };

  const isBooleanSearch = (query: string) => {
    const booleanOperators = ['AND', 'OR', 'NOT'];
    return booleanOperators.some(op => query.includes(` ${op} `)) || query.includes('"');
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">LexSearch</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Legal Intelligence</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedDocument(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">AI Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] text-slate-400">Local Browser AI Active</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 leading-tight">
              Running keyless via Transformers.js. All analysis is performed locally for privacy and speed.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <AlertCircle className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full">
          {selectedDocument ? (
            <div className="animate-fade-in">
              <button 
                onClick={() => setSelectedDocument(null)}
                className="mb-6 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to search results
              </button>
              <div className="card overflow-hidden">
                <DocumentViewer 
                  citation={selectedDocument.citation} 
                  docType={selectedDocument.docType}
                  urlEn={selectedDocument.url_en}
                  urlFr={selectedDocument.url_fr}
                  onClose={() => setSelectedDocument(null)}
                  onViewCanLII={handleViewOnCanLII}
                />
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === 'search' && (
                <>
                  <SearchForm onSearch={handleSearch} isLoading={isSearching} />
                  
                  {searchError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium">{searchError}</p>
                    </div>
                  )}

                  {nlpData && (
                    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-bold text-slate-900">AI Search Enhancement</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Optimized Query</p>
                            {isBooleanSearch(nlpData.optimizedQuery) && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200 uppercase tracking-tight">
                                Boolean Search Active
                              </span>
                            )}
                          </div>
                          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 font-mono text-sm text-slate-700">
                            {nlpData.optimizedQuery}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Concepts</p>
                          <div className="flex flex-wrap gap-2">
                            {nlpData.extractedConcepts.map((concept, i) => (
                              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isScoring && (
                    <div className="mb-8 flex items-center justify-center p-8 bg-indigo-50/50 rounded-2xl border border-indigo-100 border-dashed">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                        </div>
                        <p className="text-sm font-bold text-indigo-700">AI is analyzing and scoring results...</p>
                      </div>
                    </div>
                  )}

                  {hasSearched && !isSearching && (
                    <SearchResults 
                      results={searchResults} 
                      onSelectResult={(citation, docType, url_en, url_fr) => {
                        const result = searchResults.find(r => r.citation === citation || r.citation_en === citation || r.id === citation);
                        if (result && (result.dataset === 'ONLegis' || result.dataset?.includes('Web Search') || result.dataset?.includes('AdmiraltyLaw') || result.dataset?.includes('LegalTree') || result.dataset?.includes('Globalex') || result.dataset?.includes('Search Systems') || result.dataset?.includes('Police Record Hub')) && url_en) {
                          window.open(url_en, '_blank');
                        } else {
                          setSelectedDocument({ citation, docType, url_en, url_fr });
                        }
                      }}
                      docType={currentDocType}
                      query={nlpData ? nlpData.optimizedQuery : lastQuery}
                    />
                  )}
                  
                  {!hasSearched && (
                    <div className="text-center py-20">
                      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Search</h2>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Enter a natural language question or keywords above to search across multiple Canadian legal databases.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'coverage' && (
                <div className="card p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Database Coverage</h2>
                    <p className="text-slate-500">Detailed information about the datasets available in the A2AJ API.</p>
                  </div>
                  <CoverageTable />
                </div>
              )}

              {activeTab === 'canlii' && (
                <div className="card overflow-hidden h-[calc(100vh-16rem)]">
                  <CanLIIViewer initialUrl={canliiUrl} />
                </div>
              )}

              {activeTab === 'tla' && (
                <div className="card p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">External Legal Resources</h2>
                    <p className="text-slate-500">Direct access to specialized legal databases and public records.</p>
                  </div>
                  <TLADatabases query={lastQuery} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
