import { SearchResultItem } from "./api";

export async function formatCitation(result: SearchResultItem): Promise<string> {
  const title = result.title_en || result.title_fr || result.name_en || result.name_fr || 'Untitled Document';
  const citation = result.citation || result.citation_en || result.id || 'Unknown Citation';
  const date = result.date || result.document_date_en || result.document_date_fr || 'Unknown Date';
  const dataset = result.dataset || 'Unknown Dataset';

  // McGill Guide style formatting (Simplified)
  // Format: Title, [Year] Citation (Dataset)
  const year = date !== 'Unknown Date' ? `(${new Date(date).getFullYear()})` : '';
  
  // Clean up title (McGill usually italics, but we return plain text for now)
  const cleanTitle = title.replace(/\s+/g, ' ').trim();
  
  return `${cleanTitle}, ${year} ${citation} (${dataset})`.replace(/\s\s+/g, ' ').trim();
}
