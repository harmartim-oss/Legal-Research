import React from 'react';
import { ExternalLink, Search, BookOpen, Scale, FileText, Globe, Database } from 'lucide-react';

interface FreeDatabase {
  name: string;
  description: string;
  category: string;
  url: string;
  searchUrlTemplate?: string; // Use {query} as placeholder
  icon: React.ReactNode;
}

const FREE_DATABASES: FreeDatabase[] = [
  {
    name: 'Access LSO CPD Materials',
    description: 'Full text Law Society of Ontario seminars starting from 2004.',
    category: 'Databases & Search Tools',
    url: 'https://lso-library.primo.exlibrisgroup.com/discovery/search?vid=01LSO_INST:ACCESSCPD',
    searchUrlTemplate: 'https://lso-library.primo.exlibrisgroup.com/discovery/search?vid=01LSO_INST:ACCESSCPD&query=any,contains,{query}',
    icon: <BookOpen className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Canadian Law Blogs Search Engine',
    description: 'Google custom search filter: search law blogs for articles by experts.',
    category: 'Databases & Search Tools',
    url: 'http://www.slaw.ca/canadian-law-blogs-search-engine/',
    searchUrlTemplate: 'http://www.slaw.ca/canadian-law-blogs-search-engine/?q={query}',
    icon: <Search className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'FeeFieFoeFirm Canada',
    description: 'Google custom search filter: search law firm websites for legal experts, bulletins, and press releases.',
    category: 'Databases & Search Tools',
    url: 'http://www.feefiefoefirm.com/ca/',
    searchUrlTemplate: 'http://www.feefiefoefirm.com/ca/?q={query}',
    icon: <Search className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'SEDAR+',
    description: 'Securities documents and information filed by public companies and investment funds in Canada.',
    category: 'Databases & Search Tools',
    url: 'https://www.sedarplus.ca/',
    searchUrlTemplate: 'https://www.sedarplus.ca/csa-party/records/search.html?search={query}',
    icon: <FileText className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'EDGAR (US SEC)',
    description: 'US Securities and Exchange Commission filings.',
    category: 'Databases & Search Tools',
    url: 'https://www.sec.gov/edgar/searchedgar/webusers.htm',
    searchUrlTemplate: 'https://www.sec.gov/edgar/search/#/q={query}',
    icon: <FileText className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Legalline.ca',
    description: 'Searchable database of answers to legal questions. Available in 107 languages.',
    category: 'Databases & Search Tools',
    url: 'https://www.legalline.ca/answers/',
    searchUrlTemplate: 'https://www.legalline.ca/?s={query}',
    icon: <Scale className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Wex (Cornell LII)',
    description: 'Community-built, freely available legal dictionary and encyclopedia.',
    category: 'Dictionaries & Directories',
    url: 'https://www.law.cornell.edu/wex',
    searchUrlTemplate: 'https://www.law.cornell.edu/search/site/{query}',
    icon: <BookOpen className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Canadian Law List',
    description: 'Comprehensive directory of law firms, lawyers, judges and government departments in Canada.',
    category: 'Dictionaries & Directories',
    url: 'http://www.canadianlawlist.com/',
    searchUrlTemplate: 'https://www.canadianlawlist.com/search/?q={query}',
    icon: <Globe className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'LSO Great Library Research Guides',
    description: 'Pathfinders & research tools from the Law Society of Ontario.',
    category: 'Research Guides & Practice Support',
    url: 'https://greatguides.lsuc.on.ca/',
    searchUrlTemplate: 'https://greatguides.lsuc.on.ca/srch.php?q={query}',
    icon: <BookOpen className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Google Scholar (US Legal Research)',
    description: 'Locate American case law and legal information.',
    category: 'Research Guides & Practice Support',
    url: 'https://scholar.google.ca/',
    searchUrlTemplate: 'https://scholar.google.ca/scholar?q={query}&hl=en&as_sdt=2006',
    icon: <Search className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Steps to Justice',
    description: 'Step-by-step information about common legal problems in Ontario.',
    category: 'Research Guides & Practice Support',
    url: 'http://stepstojustice.ca/legal-topics',
    searchUrlTemplate: 'https://stepstojustice.ca/search/?q={query}',
    icon: <Scale className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'CLEO (Community Legal Education Ontario)',
    description: 'Clear, accurate & practical legal information.',
    category: 'Research Guides & Practice Support',
    url: 'http://www.cleo.on.ca/en',
    searchUrlTemplate: 'https://www.cleo.on.ca/en/search/node/{query}',
    icon: <BookOpen className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'AdmiraltyLaw.com',
    description: 'Resource for Canadian maritime and admiralty law.',
    category: 'Specialized Legal Resources',
    url: 'https://admiraltylaw.com/',
    searchUrlTemplate: 'https://admiraltylaw.com/?s={query}',
    icon: <Scale className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Legal Tree',
    description: 'A collaborative legal resource and research tool for Canadian law.',
    category: 'Specialized Legal Resources',
    url: 'https://www.legaltree.ca/',
    searchUrlTemplate: 'https://www.google.com/search?q=site:legaltree.ca+{query}',
    icon: <BookOpen className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Globalex - Canadian Legal Research',
    description: 'Comprehensive guide to Canadian legal research by NYU Law.',
    category: 'Research Guides & Practice Support',
    url: 'https://www.nyulawglobal.org/globalex/Canada1.html',
    searchUrlTemplate: 'https://www.google.com/search?q=site:nyulawglobal.org/globalex/Canada1.html+{query}',
    icon: <Globe className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Canada Free Public Records',
    description: 'Directory of free public records databases across Canada.',
    category: 'Databases & Search Tools',
    url: 'https://publicrecords.searchsystems.net/Canada_Free_Public_Records/',
    searchUrlTemplate: 'https://www.google.com/search?q=site:publicrecords.searchsystems.net/Canada_Free_Public_Records/+{query}',
    icon: <Database className="h-5 w-5 text-indigo-500" />
  },
  {
    name: 'Police Record Hub',
    description: 'Information and resources for obtaining police records in Canada.',
    category: 'Databases & Search Tools',
    url: 'https://policerecordhub.ca/en/',
    searchUrlTemplate: 'https://www.google.com/search?q=site:policerecordhub.ca+{query}',
    icon: <Database className="h-5 w-5 text-indigo-500" />
  }
];

interface TLADatabasesProps {
  query?: string;
}

export function TLADatabases({ query }: TLADatabasesProps) {
  const handleSearch = (db: FreeDatabase) => {
    if (query && db.searchUrlTemplate) {
      const url = db.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
      window.open(url, '_blank');
    } else {
      window.open(db.url, '_blank');
    }
  };

  // Group databases by category
  const groupedDatabases = FREE_DATABASES.reduce((acc, db) => {
    if (!acc[db.category]) {
      acc[db.category] = [];
    }
    acc[db.category].push(db);
    return acc;
  }, {} as Record<string, FreeDatabase[]>);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">External Legal Databases & Resources</h2>
            <p className="text-gray-600">
              Access non-paid databases, research tools, and specialized legal resources.
            </p>
          </div>
          {query && (
            <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Active Search Query</p>
              <p className="text-sm font-semibold text-indigo-900">"{query}"</p>
            </div>
          )}
        </div>

        {query && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Direct Public Record Search</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => handleSearch(FREE_DATABASES.find(db => db.name === 'Canada Free Public Records')!)}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Canada Free Public Records</p>
                    <p className="text-xs text-slate-500">Search directory for "{query}"</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
              
              <button 
                onClick={() => handleSearch(FREE_DATABASES.find(db => db.name === 'Police Record Hub')!)}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Police Record Hub</p>
                    <p className="text-xs text-slate-500">Search resources for "{query}"</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {Object.entries(groupedDatabases).map(([category, databases]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((db, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
                <div className="flex items-start mb-3">
                  <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                    {db.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 leading-tight">{db.name}</h4>
                </div>
                <p className="text-sm text-gray-600 flex-grow mb-4">{db.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => window.open(db.url, '_blank')}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    Visit Site
                  </button>
                  
                  <button
                    onClick={() => handleSearch(db)}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                      query && db.searchUrlTemplate 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {query && db.searchUrlTemplate ? (
                      <>
                        <Search className="h-3 w-3 mr-1" />
                        Search Term
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
