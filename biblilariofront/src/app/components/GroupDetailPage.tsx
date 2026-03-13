  import { useState, useRef, useEffect } from 'react';
  import { ArrowLeft, LogOut, Star, Users, Book, Edit2, Shield, Search, Filter, BookPlus, Check, Send, MessageCircle } from 'lucide-react';
  import { BookGroup, GroupBook } from '@/data/mockGroups';
  import { GroupAdminPanel } from './GroupAdminPanel';
  import { ChatMessage, ChatMessageSendDTO } from '@/data/mockMessages';

  interface GroupDetailPageProps {
    group: BookGroup;
    reloadGroup: () => Promise<void>;
    onBack: () => void;
    onLeaveGroup: (groupId: string) => void;
    currentUserId: string;
    onAcceptJoinRequest: (groupId: string, requestId: string) => void;
    onRejectJoinRequest: (groupId: string, requestId: string) => void;
    onRemoveMember: (groupId: string, memberId: string) => void;
    onTransferAdmin: (groupId: string, memberId: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onAddBookToGroup: (bookData: any) => void;
    onTogglePrivacy: (groupId: string) => void;
    onInviteUser: (groupId: string, userId: string) => void;
    availableUsers?: Array<{ id: string; name: string; email: string }>;
    currentUserName?: string;
  }

  export function GroupDetailPage({ 
    group, 
    onBack, 
    reloadGroup,
    onLeaveGroup, 
    currentUserId,
    onAcceptJoinRequest,
    onRejectJoinRequest,
    onRemoveMember,
    onTransferAdmin,
    onDeleteGroup,
    onAddBookToGroup,
    onTogglePrivacy,
    onInviteUser,
    availableUsers,
    currentUserName = 'Max',
  }: GroupDetailPageProps) {
    const [editingBook, setEditingBook] = useState<GroupBook | null>(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
    const [isbnSearch, setIsbnSearch] = useState('');
    const [bookSearchResult, setBookSearchResult] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAdmin = group.admin?.name === currentUserName;

    // Debug-Ausgabe
  console.log('ownerId:', group.admin?.name);
  console.log('currentUserName:', currentUserName, typeof currentUserName);
  console.log('isAdmin:', isAdmin);
  console.log('isPrivate', group.isPrivate);

    const pendingRequests = group.joinRequests?.length || 0;
useEffect(() => {
  const fetchGroupMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/chat/group/${group.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Fehler beim Laden der Nachrichten');

      const messages: ChatMessage[] = await res.json();
      setChatMessages(messages);
    } catch (err) {
      console.error(err);
    }
  };

  fetchGroupMessages();
}, [group.id]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chatMessages]);

// Senden einer Nachricht
const handleSendChatMessage = async () => {
  if (!chatMessage.trim()) return;

  const newMessage: ChatMessage = {
    sender: currentUserName,
    content: chatMessage,
    timestamp: new Date().toISOString(),
  };

  setChatMessages([...chatMessages, newMessage]);
  setChatMessage('');

  const token = localStorage.getItem('token');
await fetch(`http://localhost:8080/chat/group/${group.id}/send`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    senderName: currentUserName,
    content: chatMessage
  })
});
};

    // Filter books by search query and language
    const filteredBooks = group.books.filter((book) => {
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
      new Set(group.books.map((book) => book.language))
    ).sort();

  const handleIsbnSearch = async () => {
    if (isbnSearch.length < 10) return; // Mindestlänge 10 oder 13

    setIsSearching(true);
    try {
      // Beispiel: fetch von einem Backend-Endpunkt
      const token = localStorage.getItem('token'); // Falls Auth nötig
      const res = await fetch(`http://localhost:8080/books/search?isbn=${isbnSearch}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        throw new Error('Buch konnte nicht gefunden werden');
      }

      const data = await res.json();

      if (data) {
        // Annahme: das Backend liefert ein Objekt mit { title, authors, isbn, publishedDate, language, description }
        setBookSearchResult({
          title: data.title,
          authors: data.authors || [],
          isbn: data.isbn,
          publishedDate: data.publishedDate,
          language: data.language,
          description: data.description,
        });
      } else {
        alert('Kein Buch gefunden');
        setBookSearchResult(null);
      }
    } catch (err) {
      console.error(err);
      alert('Fehler bei der Buchsuche');
      setBookSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBook = async () => {
    if (!bookSearchResult) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8080/${group.id}/books?isbn=${bookSearchResult.isbn}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );



      if (!res.ok) {
        throw new Error("Fehler beim Hinzufügen");
      }

      const addedBook = await res.json();

      console.log("Book added:", addedBook);

      onAddBookToGroup(addedBook);

      setBookSearchResult(null);
      setIsbnSearch("");

                     await reloadGroup(); // 🔥 Gruppe neu laden

    } catch (err) {
      console.error(err);
      alert("Buch konnte nicht hinzugefügt werden");
    }
  };

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
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${(rating / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    };

    const handleLeaveClick = () => {
      if (isAdmin) {
        // Admin kann nicht verlassen ohne Rechte zu übertragen
        setShowLeaveConfirm(true);
      } else {
        setShowLeaveConfirm(true);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zu Gruppen
                </button>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors font-medium shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Admin-Funktionen
                    {pendingRequests > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {pendingRequests}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={handleLeaveClick}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors font-medium border border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Gruppe verlassen
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Group Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {group.name}
                  </h1>
                  {isAdmin && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Sie sind Admin
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{group.members?.length || 0} Mitglieder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    <span>{group.books?.length || 0} Bücher</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Books List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bücher der Gruppe ({group.books.length})
            </h2>

            {/* Search and Filter */}
            {group.books.length > 0 && (
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Suche nach Titel oder Autor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
            )}

            {group.books.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Diese Gruppe hat noch keine Bücher
              </p>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => (
                  <div
                    key={book.bookId}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {book.authors.join(', ')} • {book.publishedDate}
                          {book.isbn && ` • ISBN: ${book.isbn}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.reviewCount} Bewertungen in dieser Gruppe
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingBook(book)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        {book.myRating ? 'Bewertung ändern' : 'Bewerten'}
                      </button>
                    </div>

                    {/* Group Ratings */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Gruppendurchschnitt:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Sterne</p>
                          {renderStars(book.groupRatings.stars)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Qualität</p>
                          {renderRatingBar(book.groupRatings.quality)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Fetisch</p>
                          {renderRatingBar(book.groupRatings.fetish)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Cover</p>
                          {renderRatingBar(book.groupRatings.cover)}
                        </div>
                      </div>
                    </div>

                    {/* My Rating */}
                    {book.myRating && (
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <p className="text-xs font-medium text-indigo-800 mb-2">
                          Meine Bewertung vom {book.myRating.ratedDate}:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(book.myRating.stars)}
                          </div>
                          <span className="text-xs">
                            Qualität: {book.myRating.quality.toFixed(1)}
                          </span>
                          <span className="text-xs">
                            Fetisch: {book.myRating.fetish.toFixed(1)}
                          </span>
                          <span className="text-xs">
                            Cover: {book.myRating.cover.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          {book.myRating.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Book Section */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Buch zur Gruppe hinzufügen
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Als Gruppen-Admin können Sie neue Bücher über ISBN zur Gruppe hinzufügen.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={isbnSearch}
                  onChange={(e) => setIsbnSearch(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={13}
                  placeholder="ISBN-10 oder ISBN-13 eingeben"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleIsbnSearch}
                  disabled={isbnSearch.length < 10 || isSearching}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Suche...' : 'Suchen'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ISBN muss 10 oder 13 Ziffern enthalten
              </p>

              {/* Search Result */}
              {bookSearchResult && (
                <div className="mt-4">
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
                        Buch zur Gruppe hinzufügen
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
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Gruppen-Chat
            </h2>
            <div
              ref={chatContainerRef}
              className="h-60 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4"
            >
                {chatMessages.map((msg, index) => (
                  <div key={index} className="mb-2 text-sm">
                    <span className="text-gray-500">
                      {new Date(msg.timestamp).toLocaleString('de-DE')}
                    </span>
                    {" - "}
                    <span className="font-semibold">{msg.sender}</span>
                    {": "}
                    <span>{msg.content}</span>
                  </div>
                ))}
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Nachricht senden..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleSendChatMessage}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Rating Modal */}
        {editingBook && (
          <GroupBookRatingModal
            book={editingBook}
              reloadGroup={reloadGroup} 
            onSave={(updatedBook) => {


              setEditingBook(null);
            }}
            onClose={() => setEditingBook(null)}
          />
        )}

        {/* Admin Panel */}
        {isAdmin && (
          <GroupAdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            groupName={group.name}
            members={group.members || []}
            joinRequests={group.joinRequests || []}
            currentUserId={currentUserId}
            onAcceptRequest={(requestId) => onAcceptJoinRequest(group.id, requestId)}
            onRejectRequest={(requestId) => onRejectJoinRequest(group.id, requestId)}
            onRemoveMember={(memberId) => onRemoveMember(group.id, memberId)}
            onTransferAdmin={(memberId) => onTransferAdmin(group.id, memberId)}
            onDeleteGroup={() => onDeleteGroup(group.id)}
            isPrivate={group.isPrivate}
            onTogglePrivate={() => onTogglePrivacy(group.id)}
            onInviteUser={(userId) => onInviteUser(group.id, userId)}
            availableUsers={availableUsers}
          />
        )}

        {/* Leave Confirmation Modal */}
        {showLeaveConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLeaveConfirm(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {isAdmin ? (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Admin kann Gruppe nicht verlassen
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Als Admin können Sie die Gruppe "{group.name}" nicht verlassen. 
                    Sie müssen zuerst die Admin-Rechte auf ein anderes Mitglied übertragen 
                    oder die Gruppe komplett auflösen.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowLeaveConfirm(false);
                        setShowAdminPanel(true);
                      }}
                      className="w-full px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                    >
                      Zu Admin-Funktionen
                    </button>
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Schließen
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Gruppe verlassen?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Möchten Sie die Gruppe "{group.name}" wirklich verlassen? Ihre
                    Bewertungen bleiben erhalten, aber Sie haben keinen Zugriff mehr auf
                    die Gruppenseite.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        onLeaveGroup(group.id);
                        setShowLeaveConfirm(false);
                      }}
                      className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      Ja, verlassen
                    </button>
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Abbrechen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Group Book Rating Modal Component
  interface GroupBookRatingModalProps {
    book: GroupBook;
    onSave: (book: GroupBook) => void;
    onClose: () => void;
      reloadGroup: () => Promise<void>;   // NEU
  }

function GroupBookRatingModal({ book, onSave, onClose, reloadGroup  }: GroupBookRatingModalProps) {
  // Nutze myRatings und myComment statt myRating
const [ratings, setRatings] = useState(
  book.myRating
    ? { 
        stars: book.myRating.stars,
        quality: book.myRating.quality,
        fetish: book.myRating.fetish,
        cover: book.myRating.cover
      }
    : { stars: 0, quality: 0, fetish: 0, cover: 0 }
);

const [comment, setComment] = useState(book.myRating?.comment || '');

  const renderStarInput = (value: number, onChange: (v: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      if (!book) return;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const payload = { 
        stars: ratings.stars,
        quality: ratings.quality,
        fetish: ratings.fetish,
        cover: ratings.cover,
        comment: comment
      };

      const res = await fetch(`http://localhost:8080/ownCollection/rate/${book.bookId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

         await reloadGroup(); // 🔥 Gruppe neu laden

      if (!res.ok) {
        throw new Error("Fehler beim Speichern der Bewertung");
      }

// const savedRating = await res.json();  <-- entfernen

const updatedBook = {
  ...book,
  myRating: {
    stars: ratings.stars,
    quality: ratings.quality,
    fetish: ratings.fetish,
    cover: ratings.cover,
    comment: comment,
    ratedDate: new Date().toLocaleDateString('de-DE'),
  },
};

onSave(updatedBook);
onClose();

     await reloadGroup(); // 🔥 Gruppe neu laden

    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern der Bewertung");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">{book.title}</h2>
          <p className="text-sm text-indigo-100">{book.authors.join(', ')}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Sterne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sterne</label>
            {renderStarInput(ratings.stars, (v) => setRatings({ ...ratings, stars: v }))}
          </div>

          {/* Qualität */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualität (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={ratings.quality}
              onChange={(e) =>
                setRatings({
                  ...ratings,
                  quality: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Fetisch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fetisch (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={ratings.fetish}
              onChange={(e) =>
                setRatings({
                  ...ratings,
                  fetish: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={ratings.cover}
              onChange={(e) =>
                setRatings({
                  ...ratings,
                  cover: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Kommentar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kommentar</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Ihre Meinung zu diesem Buch..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Aktionen */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Speichern
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}