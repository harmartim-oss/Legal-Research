import { SearchResultItem } from "./api";
import { pipeline, env } from "@xenova/transformers";

// Configure Transformers.js to use local models if possible, but default to remote
env.allowLocalModels = false;

export interface NlpAnalysis {
  optimizedQuery: string;
  extractedConcepts: string[];
}

export interface ScoredResult {
  id: string;
  score: number;
  summary: string;
}

// Transformers.js pipelines (lazy loaded)
let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    // Using a small, fast model for feature extraction (embeddings)
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

/**
 * Calculates cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Analyzes a natural language query using local NLP rules.
 */
export async function analyzeQuery(query: string): Promise<NlpAnalysis> {
  if (query.trim().split(/\s+/).length <= 2) {
    return { optimizedQuery: query, extractedConcepts: [] };
  }

  const fillerWords = ['what', 'happens', 'if', 'can', 'i', 'how', 'do', 'a', 'the', 'is', 'are', 'please', 'find', 'search', 'for'];
  const words = query.toLowerCase().split(/\s+/);
  
  // Extract keywords
  const filtered = words.filter(w => !fillerWords.includes(w) && w.length > 2);
  
  // Detect potential phrases (simple heuristic)
  const optimizedWords = filtered.map(w => w.length > 8 ? `"${w}"` : w);
  
  return {
    optimizedQuery: optimizedWords.join(' ') || query,
    extractedConcepts: filtered.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1))
  };
}

/**
 * Scores and summarizes search results using local Transformers.js embeddings.
 */
export async function scoreAndSummarizeResults(query: string, results: SearchResultItem[]): Promise<Record<string, ScoredResult>> {
  if (!results || results.length === 0) return {};

  const scoredDict: Record<string, ScoredResult> = {};
  
  try {
    const pipe = await getExtractor();
    const queryOutput = await pipe(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryOutput.data as Float32Array);

    for (const result of results.slice(0, 10)) {
      const id = result.citation || result.id || 'unknown';
      const text = `${result.title_en || ''} ${result.snippet || ''}`;
      
      const textOutput = await pipe(text, { pooling: 'mean', normalize: true });
      const textVector = Array.from(textOutput.data as Float32Array);
      
      const similarity = cosineSimilarity(queryVector, textVector);
      const score = Math.round(similarity * 100);
      
      scoredDict[id] = {
        id,
        score: Math.max(0, Math.min(100, score + 20)), // Boost slightly for UX
        summary: `Semantic analysis suggests this document has a ${score}% conceptual match with your query. It focuses on ${result.title_en?.split(' ').slice(0, 3).join(' ') || 'relevant legal topics'}.`
      };
    }
  } catch (err) {
    console.error("Local scoring failed, using basic fallback:", err);
    
    // Basic keyword fallback
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    results.slice(0, 10).forEach(result => {
      const id = result.citation || result.id || 'unknown';
      const text = ((result.title_en || '') + ' ' + (result.snippet || '')).toLowerCase();
      let matchCount = 0;
      queryWords.forEach(word => { if (text.includes(word)) matchCount++; });
      const score = Math.min(100, Math.round((matchCount / (queryWords.length || 1)) * 100));
      scoredDict[id] = {
        id,
        score,
        summary: `Keyword analysis found ${matchCount} matches. This resource from ${result.dataset || 'the database'} appears relevant to your search.`
      };
    });
  }

  return scoredDict;
}

/**
 * Searches external sites using curated links.
 * (Note: Google Search grounding removed to eliminate Gemini dependency)
 */
export async function searchExternalSites(query: string): Promise<SearchResultItem[]> {
  // In a truly keyless environment, we provide direct links to the search engines of these sites
  const sites = [
    { name: 'AdmiraltyLaw.com', url: 'https://admiraltylaw.com/?s=' },
    { name: 'LegalTree.ca', url: 'https://legaltree.ca/search/node/' },
    { name: 'NYU Globalex', url: 'https://www.nyulawglobal.org/globalex/search.html?q=' },
  ];

  return sites.map((site, index) => ({
    id: `ext-${index}`,
    citation: site.name,
    title_en: `Search ${site.name} for "${query}"`,
    dataset: 'External Resource',
    snippet: `Click to perform a direct search on ${site.name} for your query.`,
    url_en: `${site.url}${encodeURIComponent(query)}`,
    alignmentScore: 80
  } as any));
}
