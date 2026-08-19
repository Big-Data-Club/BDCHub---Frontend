"use client";

import { useState } from "react";
import { PrimaryBtn, SecondaryBtn } from "@/components/lms/shared/Button";
import { Select, SearchBar } from "@/components/lms/shared";
import { SlidersHorizontal } from "lucide-react";

interface ForumSearchBarProps {
  sortBy: 'votes' | 'newest' | 'oldest' | 'views';
  onSortChange: (sort: 'votes' | 'newest' | 'oldest' | 'views') => void;
  onSearch: (search: string, tags: string) => void;
}

export default function ForumSearchBar({ sortBy, onSortChange, onSearch }: ForumSearchBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchInput, tagsInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 p-6 space-y-4 shadow-sm">
      {/* Search Bar */}
      <div className="flex gap-2">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onKeyDown={handleKeyPress}
          placeholder="Tìm kiếm trong tiêu đề và nội dung..."
          size="md"
          containerClassName="flex-1"
        />
        <PrimaryBtn onClick={handleSearch}>
          Tìm kiếm
        </PrimaryBtn>
        <SecondaryBtn
          onClick={() => setShowFilters(!showFilters)}
          icon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Lọc
        </SecondaryBtn>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <Select
              label="Sắp xếp theo"
              value={sortBy}
              onValueChange={(val) => onSortChange(val as any)}
              options={[
                { value: "votes", label: "Điểm cao nhất" },
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
                { value: "views", label: "Xem nhiều nhất" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">Lọc theo tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="vd: javascript,react,typescript"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Quick Sort Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onSortChange('votes')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            sortBy === 'votes'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🔥 Phổ biến
        </button>
        <button
          onClick={() => onSortChange('newest')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            sortBy === 'newest'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          ⏰ Mới nhất
        </button>
        <button
          onClick={() => onSortChange('views')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            sortBy === 'views'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          👁️ Xem nhiều
        </button>
      </div>
    </div>
  );
}