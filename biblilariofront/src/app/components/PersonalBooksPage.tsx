import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Edit2, Trash2, Star, Send, Check } from 'lucide-react';
import { Book } from './BookTable';
import { API } from "../../api";

interface PersonalBook {
  bookId: string;
  title: string;
  authors: string[];
  language: string;
  publishedDate: string;
  isbn?: string;
  myRatings: {
    stars: number;
    quality: number;
    fetish: number;
    cover: number;
  };
  myComment: string;
}

interface PersonalBooksPageProps {
  onBack: () => void;
  userName: string;
  allBooks: Book[];
  onSuggestBook: (bookData: any) => void;
}

export function PersonalBooksPage({ onBack, userName, allBooks, onSuggestBook }: PersonalBooksPageProps) {
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<PersonalBook | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isbnSuggest, setIsbnSuggest] = useState('');
  const [isSearchingSuggest, setIsSearchingSuggest] = useState(false);
  const [suggestResult, setSuggestResult] = useState<any>(null);
  const [personalBooks, setPersonalBooks] = useState<PersonalBook[]>([]);
const [popupMessage, setPopupMessage] = useState<string | null>(null);
  // Load personal books
  useEffect(() => {
    const fetchPersonalBooks = async () => {
      try {
        const res = await fetch(`${API.base}/ownCollection`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Fehler beim Laden Ihrer Bücher');

        const data = await res.json();
        console.log("Backend Response:", data);

        const books: PersonalBook[] = data.map((b: any) => ({
          bookId: b.bookId,
          title: b.title,
          authors: b.authors || [],
          language: b.language,
          publishedDate: b.publishedDate,
          isbn: b.id,
          myRatings: {
            stars: b.ratings?.stars || 0,
            quality: b.ratings?.quality || 0,
            fetish: b.ratings?.fetish || 0,
            cover: b.ratings?.cover || 0,
          },
          myComment: b.myComment || '',
        }));

        setPersonalBooks(books);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPersonalBooks();
  }, [token]);

  // Search books
  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const res = await fetch(`${API.base}/collectionSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ search: searchQuery }),
      });

      if (!res.ok) throw new Error('Fehler beim Laden der Bücher');

      const data = await res.json();
      console.log("Backend Response:", data);

      if (!Array.isArray(data) || data.length === 0) {
        setSearchResults([]);
        alert('Kein Buch gefunden.');
        return;
      }

      const results = data.map((b: any) => ({
        id: b.id,
        title: b.title,
        authors: b.authors || [],
        language: b.language,
        publishedDate: b.publishedDate,
        isbn: b.id,
      }));

      setSearchResults(results);

    } catch (err) {
      console.error(err);
      alert('Fehler beim Suchen.');
    }
  };

  const handleDeleteBook = (bookId: string) => {
    setPersonalBooks(personalBooks.filter((b) => b.bookId !== bookId));
  };

const handleSuggestBook = () => {
  const token = localStorage.getItem('token');

  setIsSearchingSuggest(true);

  fetch(`${API.base}/books/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      isbn: isbnSuggest,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Fehler beim Vorschlagen");
      }

      return res.json().catch(() => null);
    })
    .then(() => {
      setSuggestResult(null);
      setIsbnSuggest("");
      setPopupMessage("✅ Buchvorschlag erfolgreich gesendet");
    })
    .catch((err) => {
      console.error(err);
      setPopupMessage("❌ " + err.message);
      setSuggestResult(null);
    })
    .finally(() => {
      setIsSearchingSuggest(false);
    });
};

  const renderStars = (rating: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((value) => (
          <Star
            key={value}
            className={`w-5 h-5 ${value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => onChange?.(value)}
          />
        ))}
      </div>
    );
  };

  return (
    
    <div className="min-h-screen bg-gray-50">
      {popupMessage && (
  <div className="fixed top-5 right-5 z-50 bg-black text-white px-4 py-3 rounded-md shadow-lg">
    <div className="flex items-center gap-3">
      <span>{popupMessage}</span>

      <button
        onClick={() => setPopupMessage(null)}
        className="font-bold ml-2"
      >
        ✕
      </button>
    </div>
  </div>
)}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Übersicht
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Meine Bücher</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Neues Buch hinzufügen</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Suche nach Titel, Autor oder ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Suchen
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 font-medium">Suchergebnisse:</p>
              {searchResults.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">{book.title}</p>
                    <p className="text-sm text-gray-600">
                      {book.authors.join(', ')} • {book.publishedDate}
                      {book.isbn && ` • ISBN: ${book.isbn}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBook({
                        bookId: book.id,
                        title: book.title,
                        authors: book.authors,
                        language: book.language,
                        publishedDate: book.publishedDate,
                        isbn: book.id,
                        myRatings: { stars: 0, quality: 0, fetish: 0, cover: 0 },
                        myComment: '',
                      });
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Bewerten
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

         {/* ISBN Book Suggestion Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Buch zur Datenbank vorschlagen
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Sie können Bücher per ISBN vorschlagen, die noch nicht in unserer Datenbank sind. Ein Administrator wird Ihren Vorschlag prüfen.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="ISBN-10 oder ISBN-13 eingeben"
              value={isbnSuggest}
              onChange={(e) => setIsbnSuggest(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={13}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSuggestBook}
              disabled={isbnSuggest.length < 10 || isSearchingSuggest}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearchingSuggest ? (
                'Suche...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Vorschlagen
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ISBN muss 10 oder 13 Ziffern enthalten
          </p>

          {/* Suggestion Result */}
          {suggestResult && (
            <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 text-lg mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Buch gefunden
              </h3>
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Titel:</span>
                  <p className="text-sm text-gray-800">{suggestResult.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Autor(en):</span>
                  <p className="text-sm text-gray-800">
                    {suggestResult.authors.join(', ')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">ISBN:</span>
                    <p className="text-sm text-gray-800">{suggestResult.isbn}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Jahr:</span>
                    <p className="text-sm text-gray-800">
                      {suggestResult.publishedDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onSuggestBook(suggestResult);
                    setSuggestResult(null);
                    setIsbnSuggest('');
                    alert('Ihr Buchvorschlag wurde an die Administratoren gesendet!');
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  An Admin senden
                </button>
                <button
                  onClick={() => {
                    setSuggestResult(null);
                    setIsbnSuggest('');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}


        </div>

        {/* Personal Books List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Meine bewerteten Bücher ({personalBooks.length})
          </h2>

          {personalBooks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Sie haben noch keine Bücher bewertet</p>
          ) : (
            <div className="space-y-4">
              {personalBooks.map((book) => (
                <div key={book.bookId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{book.title}</h3>
                      <p className="text-sm text-gray-600">
                        {book.authors.join(', ')} • {book.publishedDate}
                        {book.isbn && ` • ISBN: ${book.isbn}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingBook(book)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteBook(book.bookId)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Sterne</p>
                      {renderStars(book.myRatings.stars)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Qualität</p>
                      <p className="text-sm font-semibold text-gray-800">{book.myRatings.quality.toFixed(1)} / 10</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fetisch</p>
                      <p className="text-sm font-semibold text-gray-800">{book.myRatings.fetish.toFixed(1)} / 10</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Cover</p>
                      <p className="text-sm font-semibold text-gray-800">{book.myRatings.cover.toFixed(1)} / 10</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{book.myComment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit/Add Rating Modal */}
      {editingBook && (
        <RatingModal
          book={editingBook}
          onSave={(updatedBook) => {
            const existingIndex = personalBooks.findIndex((b) => b.bookId === updatedBook.bookId);
            if (existingIndex >= 0) {
              const newBooks = [...personalBooks];
              newBooks[existingIndex] = updatedBook;
              setPersonalBooks(newBooks);
            } else {
              setPersonalBooks([...personalBooks, updatedBook]);
            }
            setEditingBook(null);
          }}
          onClose={() => setEditingBook(null)}
        />
      )}
    </div>
  );
}

// Rating Modal Component
interface RatingModalProps {
  book: PersonalBook;
  onSave: (book: PersonalBook) => void;
  onClose: () => void;
}

function RatingModal({ book, onSave, onClose }: RatingModalProps) {
  const token = localStorage.getItem("token");
  const [ratings, setRatings] = useState(book.myRatings);
  const [comment, setComment] = useState(book.myComment);

  const renderStarInput = (value: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );

  const handleSave = async () => {
    try {
      const updatedBook = { ...book, myRatings: ratings, myComment: comment};
      const res = await fetch(`${API.base}/ownCollection/rate/${book.bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...ratings, comment }),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");

      onSave(updatedBook);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern der Bewertung");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">{book.title}</h2>
          <p className="text-sm text-indigo-100">{book.authors.join(', ')}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sterne</label>
            {renderStarInput(ratings.stars, v => setRatings({ ...ratings, stars: v }))}
          </div>
          {["quality","fetish","cover"].map(key => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{key.charAt(0).toUpperCase() + key.slice(1)} (0-10)</label>
              <input
                type="number" min="0" max="10" step="0.1"
                value={ratings[key as keyof typeof ratings]}
                onChange={e => setRatings({...ratings, [key]: Math.min(10, Math.max(0, parseFloat(e.target.value)||0))})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kommentar</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Ihre Meinung zu diesem Buch..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">Speichern</button>
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  );
}