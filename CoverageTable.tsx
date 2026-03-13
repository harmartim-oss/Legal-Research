import React, { useEffect, useState } from 'react';
import { Database, Loader2, AlertCircle } from 'lucide-react';
import { getCoverage, CoverageItem } from '../lib/api';

export function CoverageTable() {
  const [docType, setDocType] = useState<'cases' | 'laws'>('cases');
  const [coverageData, setCoverageData] = useState<CoverageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoverage() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCoverage(docType);
        if (response && response.results) {
          setCoverageData(response.results);
        } else {
          setCoverageData([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load coverage data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCoverage();
  }, [docType]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-indigo-600" />
            Dataset Coverage
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of the available legal databases and their date ranges.
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setDocType('cases')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              docType === 'cases' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Case Law
          </button>
          <button
            onClick={() => setDocType('laws')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              docType === 'laws' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Statutes & Regulations
          </button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading coverage data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dataset Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coverageData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {item.dataset}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-medium">{item.description_en}</div>
                    {item.description_fr && <div className="text-gray-500 text-xs mt-1">{item.description_fr}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.earliest_document_date ? new Date(item.earliest_document_date).getFullYear() : '?'} -{' '}
                    {item.latest_document_date ? new Date(item.latest_document_date).getFullYear() : '?'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {item.number_of_documents.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
