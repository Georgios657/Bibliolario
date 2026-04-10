import { useState, useEffect } from 'react';
import { Search, Shield, Ban, Check, UserCog, UserMinus, UserPlus, BookPlus, LogOut, X, Settings } from 'lucide-react';
import { User } from '@/data/mockUsers';
import { Book } from '@/app/components/BookTable';
  import { useWebSocket, WebSocketProvider } from "../WebSocketContext";
import { API } from "../../api";


interface GlobalAdminPageProps {
  onBack?: () => void;
  onLogout: () => void;
  users: User[];
  currentUserId: string;
  currentUserIsSuperAdmin: boolean;
  onToggleBlock: (userId: string) => void;
  onToggleAdmin: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddBook: (Book: any) => void;
  bookSuggestionsIn: Book[];
  onApproveSuggestion: (bookData: any) => void;
  onRejectSuggestion: (bookDate: any) => void;
  filteredUsers: User[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onOpenSettings: () => void;
}

export function GlobalAdminPage({
  onBack,
  onLogout,
  users,
  currentUserId,
  currentUserIsSuperAdmin,
  onToggleBlock,
  onToggleAdmin,
  onDeleteUser,
  onAddBook,
  bookSuggestionsIn,
  onApproveSuggestion,
  onRejectSuggestion,
  filteredUsers,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
}: GlobalAdminPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  const [isbnSearch, setIsbnSearch] = useState('');
  const [bookSearchResult, setBookSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { clientRef, connected } = useWebSocket();
  const [bookSuggestions, setbookSuggestions] = useState(bookSuggestionsIn);

useEffect(() => {
  setbookSuggestions(bookSuggestionsIn);
}, [bookSuggestionsIn]);

useEffect(() => {
    console.log("🟢 useEffect läuft");
  const client = clientRef.current;

    console.log("🔌 client:", client);

  if (!client) return;

    console.log("🔗 connected:", client.connected);


  if (!client.connected) return;

  const sub = client.subscribe("/topic/admin/suggestions", (msg) => {
      console.log("📩 RAW MESSAGE:", msg);

    const data = JSON.parse(msg.body);
      console.log("📦 PARSED DATA:", data);
        console.log("🔎 TYPE:", data.type);
       console.log("📦 PAYLOAD:", data.payload);

      switch (data.type) {
    case "CREATE":
      setbookSuggestions((prev) => [...prev, data.payload]);
      break;

    case "DELETE":
    case "PUT":
      setbookSuggestions((prev) =>
        prev.filter((s) => s.isbn !== data.payload.isbn)
      );
      break;
        }
  });

  return () => sub.unsubscribe();
}, [clientRef.current]);


const handleIsbnSearch = async () => {
  try {
    const token = localStorage.getItem("token");

    // 👉 hier musst du deine ISBN herbekommen (z. B. aus einem Input-State)
    const isbn = isbnSearch; // z.B. useState

    if (!isbn) {
      alert("Bitte ISBN eingeben");
      return;
    }

    const res = await fetch(`${API.base}/books/add/${isbn}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Fehler beim Hinzufügen des Buchs");
    }

    const data = await res.text(); // oder .json()
    console.log("Erfolg:", data);

    alert("Buch wurde erfolgreich hinzugefügt!");

  } catch (err) {
    console.error(err);
    alert("Fehler beim Hinzufügen des Buchs");
  }
};

  const handleAddBook = () => {
    if (bookSearchResult) {
      onAddBook(bookSearchResult);
      setBookSearchResult(null);
      setIsbnSearch('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Administrator-Bereich
              </h1>
              {currentUserIsSuperAdmin && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                  SUPER ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Einstellungen
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Mitgliederverwaltung
              </div>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'books'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookPlus className="w-5 h-5" />
                Bücher hinzufügen
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Alle Mitglieder ({users.length})
              </h2>
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suche nach Name oder E-Mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg ${
                    user.role === "BLOCKED"
                      ? 'bg-red-50 border-red-200'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">
                            {user.name}
                          </h3>

                          {/* 👉 Role Badges */}
                          {user.role === "ADMIN" && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}

                          {user.role === "SUPERADMIN" && (
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Superadmin
                            </span>
                          )}

                          {user.role === "BLOCKED" && (
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Gesperrt
                            </span>
                          )}

                          {/* 👉 "Sie" zusätzlich */}
                          {String(user.id) === currentUserId && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              Sie
                            </span>
                          )}
                        </div>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    </div>

                    {String(user.id) !== currentUserId && (
                      <div className="flex gap-2 ml-4">
                        {user.role !== "SUPERADMIN" && (
                          user.role === "BLOCKED" ? (
                            <button
                              onClick={() => onToggleBlock(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors text-sm font-medium"
                              title="Entsperren"
                            >
                              <Check className="w-4 h-4" />
                              Entsperren
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleBlock(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors text-sm font-medium"
                              title="Sperren"
                            >
                              <Ban className="w-4 h-4" />
                              Sperren
                            </button>
                          )
                        )}

                        {user.role !== "SUPERADMIN" && 
                        user.role !== "BLOCKED" &&
                        (
                          user.role === "ADMIN" ? (
                            <button
                              onClick={() => onToggleAdmin(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md transition-colors text-sm font-medium"
                              title="Admin-Rechte entziehen"
                            >
                              <UserMinus className="w-4 h-4" />
                              Degradieren
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleAdmin(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md transition-colors text-sm font-medium"
                              title="Zum Admin ernennen"
                            >
                              <UserPlus className="w-4 h-4" />
                              Zu Admin ernennen
                            </button>
                          )
                        )}

                        {currentUserIsSuperAdmin && user.role !== "SUPERADMIN" && (
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors text-sm font-medium"
                            title="Benutzer löschen"
                          >
                            <UserMinus className="w-4 h-4" />
                            Löschen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div>
            {/* Book Suggestions Section */}
            {bookSuggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Buchvorschläge von Benutzern
                  </h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                    {bookSuggestions.length} neue
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Benutzer haben folgende Bücher zur Aufnahme in die Datenbank vorgeschlagen.
                </p>

                {/* Suggestions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Titel
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Autor(en)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          ISBN
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Jahr
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Aktion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookSuggestions.map((suggestion) => (
                        <tr
                          key={suggestion.isbn}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                            {suggestion.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {suggestion.authors.join(', ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {suggestion.isbn}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {suggestion.publishedDate}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                    onApproveSuggestion(suggestion);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors text-sm font-medium"
                                title="Buch zur Datenbank hinzufügen"
                              >
                                <Check className="w-4 h-4" />
                                Ja
                              </button>
                              <button
                                onClick={() => onRejectSuggestion(suggestion)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors text-sm font-medium"
                                title="Vorschlag ablehnen"
                              >
                                <X className="w-4 h-4" />
                                Nein
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ISBN Search Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Buch über ISBN hinzufügen
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Geben Sie eine ISBN-10 oder ISBN-13 Nummer ein, um ein Buch zur
                Datenbank hinzuzufügen.
              </p>

              {/* ISBN Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN-Nummer
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="z.B. 9783518368541"
                    value={isbnSearch}
                    onChange={(e) => setIsbnSearch(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={13}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleIsbnSearch}
                    disabled={isbnSearch.length < 10 || isSearching}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? 'Suche...' : 'Suchen'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ISBN muss 10 oder 13 Ziffern enthalten
                </p>
              </div>

              {/* Search Result */}
              {bookSearchResult && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Buch gefunden
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Titel:</span>
                      <p className="text-sm text-gray-800">{bookSearchResult.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Autor(en):</span>
                      <p className="text-sm text-gray-800">
                        {bookSearchResult.authors.join(', ')}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">ISBN:</span>
                        <p className="text-sm text-gray-800">{bookSearchResult.isbn}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Jahr:</span>
                        <p className="text-sm text-gray-800">
                          {bookSearchResult.publishedDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sprache:</span>
                        <p className="text-sm text-gray-800">
                          {bookSearchResult.language}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Beschreibung:</span>
                      <p className="text-sm text-gray-800">
                        {bookSearchResult.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddBook}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      <BookPlus className="w-4 h-4" />
                      Buch zur Datenbank hinzufügen
                    </button>
                    <button
                      onClick={() => {
                        setBookSearchResult(null);
                        setIsbnSearch('');
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Benutzer wirklich löschen?
            </h2>
            <p className="text-gray-600 mb-6">
              Möchten Sie den Benutzer "{users.find((u) => u.id === showDeleteConfirm)?.name}" wirklich unwiderruflich löschen? 
              Alle Daten dieses Benutzers werden dauerhaft entfernt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteUser(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Ja, löschen
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}