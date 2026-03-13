import { useState } from 'react';
import { Star, Search, Filter } from 'lucide-react';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  language: string;
  publishedDate: string;
  ratings: {
    stars: number;
    quality: number;
    fetish: number;
    cover: number;
  };
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  comment: string;
  date: string;
  ratings: {
    stars: number;
    quality: number;
    fetish: number;
    cover: number;
  };
}

interface BookTableProps {
  books: Book[];
  onBookTitleClick: (book: Book) => void;
}

export function BookTable({ books, onBookTitleClick }: BookTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filter books by search query and language
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === '' ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLanguage =
      selectedLanguage === 'all' || book.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  // Get unique languages for filter
  const availableLanguages = Array.from(
    new Set(books.map((book) => book.language))
  ).sort();

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'authors':
        aValue = a.authors.join(', ');
        bValue = b.authors.join(', ');
        break;
      case 'language':
        aValue = a.language;
        bValue = b.language;
        break;
      case 'publishedDate':
        aValue = new Date(a.publishedDate).getTime();
        bValue = new Date(b.publishedDate).getTime();
        break;
      case 'stars':
      case 'quality':
      case 'fetish':
      case 'cover':
        aValue = a.ratings[sortColumn as keyof typeof a.ratings];
        bValue = b.ratings[sortColumn as keyof typeof b.ratings];
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderRatingBar = (rating: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${(rating / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Suche nach Titel oder Autor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Alle Sprachen</option>
            {availableLanguages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Titel
                {sortColumn === 'title' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('authors')}
            >
              <div className="flex items-center gap-2">
                Autoren
                {sortColumn === 'authors' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('language')}
            >
              <div className="flex items-center gap-2">
                Sprache
                {sortColumn === 'language' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('publishedDate')}
            >
              <div className="flex items-center gap-2">
                Veröffentlichung
                {sortColumn === 'publishedDate' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('stars')}
            >
              <div className="flex items-center gap-2">
                Sterne
                {sortColumn === 'stars' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('quality')}
            >
              <div className="flex items-center gap-2">
                Qualität
                {sortColumn === 'quality' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('fetish')}
            >
              <div className="flex items-center gap-2">
                Fetisch
                {sortColumn === 'fetish' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSort('cover')}
            >
              <div className="flex items-center gap-2">
                Cover
                {sortColumn === 'cover' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedBooks.map((book) => (
            <tr
              key={book.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <button
                  onClick={() => onBookTitleClick(book)}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-left"
                >
                  {book.title}
                </button>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {book.authors.join(', ')}
              </td>
              <td className="px-4 py-3 text-gray-700">{book.language}</td>
              <td className="px-4 py-3 text-gray-700">{book.publishedDate}</td>
              <td className="px-4 py-3">{renderStars(book.ratings.stars)}</td>
              <td className="px-4 py-3">{renderRatingBar(book.ratings.quality)}</td>
              <td className="px-4 py-3">{renderRatingBar(book.ratings.fetish)}</td>
              <td className="px-4 py-3">{renderRatingBar(book.ratings.cover)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}