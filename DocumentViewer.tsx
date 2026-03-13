import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchDocument, FetchParams } from '../lib/api';

interface DocumentViewerProps {
  citation: string;
  docType: 'cases' | 'laws';
  urlEn?: string;
  urlFr?: string;
  onClose: () => void;
  onViewCanLII: (url: string) => void;
}

export function DocumentViewer({ citation, docType, urlEn, urlFr, onClose, onViewCanLII }: DocumentViewerProps) {
  const [documentContent, setDocumentContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocument() {
      setIsLoading(true);
      setError(null);
      try {
        const params: FetchParams = { citation, doc_type: docType, output_language: 'both' };
        const response = await fetchDocument(params);
        if (response && response.results && response.results.length > 0) {
          setDocumentContent(response.results[0]);
        } else {
          setError('Document not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load document.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDocument();
  }, [citation, docType]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (!documentContent) return null;

    const title = documentContent.title_en || documentContent.title_fr || documentContent.name_en || documentContent.name_fr || citation;
    const textEn = documentContent.text_en;
    const textFr = documentContent.text_fr;
    const date = documentContent.date || documentContent.document_date_en || documentContent.document_date_fr;

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <div className="mt-2 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{citation}</span>
                {date && <span>{new Date(date).toLocaleDateString()}</span>}
                {documentContent.dataset && <span>{documentContent.dataset}</span>}
              </div>
            </div>
            {(urlEn || urlFr) && (
              <div className="flex flex-shrink-0 space-x-2">
                {urlEn && (
                  <button
                    onClick={() => onViewCanLII(urlEn)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    View on CanLII (EN)
                  </button>
                )}
                {urlFr && (
                  <button
                    onClick={() => onViewCanLII(urlFr)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    View on CanLII (FR)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {textEn && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100">English</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-serif">
                {textEn}
              </div>
            </div>
          )}
          {textFr && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100">Français</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-serif">
                {textFr}
              </div>
            </div>
          )}
          {!textEn && !textFr && (
            <div className="col-span-1 lg:col-span-2 text-center text-gray-500 py-12">
              No text content available for this document.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Document Viewer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
