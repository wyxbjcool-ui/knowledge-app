import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
}

export default function SearchBar({ placeholder = '搜索知识点...', onSearch, value = '' }: Props) {
  const [query, setQuery] = useState(value);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onSearch(v);
  };

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
