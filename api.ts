export const API_BASE_URL = 'https://api.a2aj.ca';

export interface SearchParams {
  query: string;
  search_type?: 'full_text' | 'name';
  doc_type?: 'cases' | 'laws';
  size?: number;
  search_language?: 'en' | 'fr';
  sort_results?: 'default' | 'newest_first' | 'oldest_first';
  dataset?: string;
  start_date?: string;
  end_date?: string;
  data_source?: 'a2aj' | 'onlegis';
  use_nlp?: boolean;
}

export interface SearchResultItem {
  id?: string;
  citation?: string;
  title_en?: string;
  title_fr?: string;
  name_en?: string;
  name_fr?: string;
  date?: string;
  dataset?: string;
  snippets?: string[];
  snippet?: string;
  url_en?: string;
  url_fr?: string;
  alignmentScore?: number;
  aiSummary?: string;
  [key: string]: any;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

export interface FetchParams {
  citation: string;
  doc_type?: 'cases' | 'laws';
  output_language?: 'en' | 'fr' | 'both';
  section?: string;
  start_char?: number;
  end_char?: number;
}

export interface FetchResponse {
  results: any[];
}

export interface CoverageItem {
  dataset: string;
  description_en: string | null;
  description_fr: string | null;
  earliest_document_date: string | null;
  latest_document_date: string | null;
  number_of_documents: number;
}

export interface CoverageResponse {
  results: CoverageItem[];
}

export async function searchLegalData(params: SearchParams): Promise<SearchResponse> {
  const url = new URL(`${API_BASE_URL}/search`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in searchLegalData:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error("Network error: Unable to connect to the A2AJ search API. Please check your internet connection or try again later.");
    }
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred during the search.");
  }
}

export async function fetchDocument(params: FetchParams): Promise<FetchResponse> {
  const url = new URL(`${API_BASE_URL}/fetch`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch document with status ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchDocument:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error("Network error: Unable to connect to the A2AJ fetch API. Please check your internet connection or try again later.");
    }
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred while fetching the document.");
  }
}

export async function getCoverage(doc_type: 'cases' | 'laws' = 'cases'): Promise<CoverageResponse> {
  const url = new URL(`${API_BASE_URL}/coverage`);
  url.searchParams.append('doc_type', doc_type);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch coverage data with status ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCoverage:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error("Network error: Unable to connect to the A2AJ coverage API. Please check your internet connection or try again later.");
    }
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred while fetching coverage data.");
  }
}

export interface ONLegisSearchResult {
  searchId: string;
  snippet: string;
  labelAndTitle: string;
  documentId: number;
  documentProductNumber: string;
  type: string;
  documentTitle: string;
}

export interface ONLegisSearchResponse {
  results: {
    numberOfHits: number;
    page: number;
    results: ONLegisSearchResult[];
  };
}

export async function searchONLegis(query: string, page: number = 0): Promise<ONLegisSearchResponse> {
  try {
    const response = await fetch('https://qweri.lexum.com/w/onlegis/api/dashboard/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        page,
        rows: 25,
        query,
        locale: 'en',
        types: ['DOCUMENT'],
        sortBy: 'RELEVANCE',
        stringWidgets: [],
        dateWidgets: [],
        dateRangeWidgets: [],
        tagWidgets: []
      })
    });

    if (!response.ok) {
      throw new Error(`ONLegis search failed with status ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in searchONLegis:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error("Network error: Unable to connect to the ONLegis search API. Please check your internet connection or try again later.");
    }
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred during the ONLegis search.");
  }
}
