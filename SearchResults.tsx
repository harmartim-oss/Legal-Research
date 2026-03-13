import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Database, ExternalLink, Copy, Check, Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchResultItem } from '../lib/api';
import { formatCitation } from '../lib/citationFormatter';

interface SearchResultsProps {
  results: SearchResultItem[];
  onSelectResult: (citation: string, docType: 'cases' | 'laws', url_en?: string, url_fr?: string) => void;
  docType: 'cases' | 'laws';
  query?: string;
}

function highlightText(text: string, query?: string) {
  if (!text) return '';
  
  // If the text already contains HTML highlighting tags from the backend, 
  // we just return it and let the CSS handle the styling.
  if (text.includes('<b') || text.includes('<em') || text.includes('<mark')) {
    return text;
  }

  if (!query) return text;

  // Otherwise, manually highlight the query terms
  // Remove quotes and special characters for highlighting purposes
  const cleanQuery = query.replace(/["']/g, '');
  // Filter out boolean operators from being highlighted
  const booleanOperators = ['AND', 'OR', 'NOT'];
  const terms = cleanQuery.split(/\s+/)
    .filter(t => t.length > 2 && !booleanOperators.includes(t.toUpperCase()));
  
  if (terms.length === 0) return text;

  // Escape HTML to prevent injection before we add our own tags
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  let highlighted = escapeHtml(text);
  
  // Sort terms by length descending so longer terms are highlighted first
  terms.sort((a, b) => b.length - a.length);

  terms.forEach(term => {
    // Escape regex special characters
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use a regex that ignores case and avoids replacing inside already added HTML tags
    const regex = new RegExp(`(${safeTerm})(?![^<]*>)`, 'gi');
    highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">$1</mark>');
  });
  
  return highlighted;
}

export function SearchResults({ results, onSelectResult, docType, query }: SearchResultsProps) {
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 15;

  // Reset to page 1 when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  const handleCopyCitation = async (e: React.MouseEvent, result: SearchResultItem, citationStr: string) => {
    e.stopPropagation(); // Prevent opening the document
    const id = citationStr;
    
    setCopyingId(id);
    try {
      const formattedCitation = await formatCitation(result);
      await navigator.clipboard.writeText(formattedCitation);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
      // Fallback to raw citation
      await navigator.clipboard.writeText(citationStr);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } finally {
      setCopyingId(null);
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  // CSS classes to style backend-provided highlighting tags (<b>, <em>, <mark>)
  const highlightClasses = "[&_b]:bg-yellow-200 [&_b]:text-yellow-900 [&_b]:px-1 [&_b]:rounded [&_b]:font-medium [&_em]:bg-yellow-200 [&_em]:text-yellow-900 [&_em]:px-1 [&_em]:rounded [&_em]:font-medium [&_em]:not-italic [&_mark]:bg-yellow-200 [&_mark]:text-yellow-900 [&_mark]:px-1 [&_mark]:rounded [&_mark]:font-medium";

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const paginatedResults = results.slice(startIndex, startIndex + RESULTS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {paginatedResults.map((result, index) => {
        const title = result.title_en || result.title_fr || result.name_en || result.name_fr || 'Untitled Document';
        const citation = result.citation || result.citation_en || result.id || 'Unknown Citation';
        const date = result.date || result.document_date_en || result.document_date_fr;
        const formattedDate = date ? new Date(date).toLocaleDateString() : 'Unknown Date';
        const dataset = result.dataset || 'Unknown Dataset';

        return (
          <div 
            key={`${citation}-${index}`} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer"
            onClick={() => onSelectResult(citation, docType, result.url_en, result.url_fr)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-900 leading-tight">
                      {title}
                    </h3>
                    {result.alignmentScore !== undefined && (
                      <div className="flex items-center" title={`AI Alignment Score: ${result.alignmentScore}/100`}>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          <div 
                            className={`h-full ${result.alignmentScore >= 80 ? 'bg-green-500' : result.alignmentScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${result.alignmentScore}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-500">{result.alignmentScore}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                    <span className="inline-flex items-center font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {citation}
                    </span>
                    <button
                      onClick={(e) => handleCopyCitation(e, result, citation)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors focus:outline-none font-medium"
                      title="Copy McGill Guide Citation"
                    >
                      {copyingId === citation ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : copiedId === citation ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === citation ? 'Copied!' : 'Copy Citation'}</span>
                    </button>
                    <span className="inline-flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formattedDate}
                    </span>
                    <span className="inline-flex items-center">
                      <Database className="h-3.5 w-3.5 mr-1" />
                      {dataset}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {result.aiSummary && (
                <div className="mt-2 mb-4 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <div className="flex items-start">
                    <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      {result.aiSummary}
                    </p>
                  </div>
                </div>
              )}

              {result.snippets && result.snippets.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Snippets</h4>
                  <div className={`bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100 ${highlightClasses}`}>
                    {result.snippets.map((snippet, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(snippet, query) }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.snippet && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Snippet</h4>
                  <div className={`bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100 ${highlightClasses}`}>
                    <span dangerouslySetInnerHTML={{ __html: highlightText(result.snippet, query) }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + RESULTS_PER_PAGE, results.length)}</span> of{' '}
                <span className="font-medium">{results.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
