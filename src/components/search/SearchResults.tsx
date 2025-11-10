
import { SearchResult } from '@/hooks/useSearch';
import { format } from 'date-fns';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  hasQuery: boolean;
  onResultClick: (result: SearchResult) => void;
}

const SearchResults = ({ results, isLoading, hasQuery, onResultClick }: SearchResultsProps) => {
  if (!hasQuery) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-sm">No results found</div>
          <div className="text-xs mt-1">Try adjusting your search terms</div>
        </div>
      ) : (
        <div className="py-2">
          <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => onResultClick(result)}
              className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {result.type === 'transaction' ? (
                    <span className="text-xs">💳</span>
                  ) : (
                    <span className="text-xs">{result.icon || '📁'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                </div>
              </div>
              {result.amount && (
                <div className="flex-shrink-0 ml-2">
                  <span className={`text-sm font-medium ${
                    result.transactionType === 'expense' ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {result.transactionType === 'expense' ? '-' : '+'}${Number(result.amount).toFixed(2)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
