import { LogOut, User, BookOpen, Users, Bell, Shield, Settings } from 'lucide-react';
import { BookTable, Book } from './BookTable';

interface MainPageProps {
  books: Book[];
  onBookTitleClick: (book: Book) => void;
  onLogout: () => void;
  userName?: string;
  onGoToPersonalBooks: () => void;
  onGoToGroups: () => void;
  onOpenMessages: () => void;
  unreadMessageCount: number;
  isGlobalAdmin: boolean;
  onGoToGlobalAdmin: () => void;
  onOpenSettings: () => void;
}

export function MainPage({ 
  books, 
  onBookTitleClick, 
  onLogout, 
  userName, 
  onGoToPersonalBooks, 
  onGoToGroups,
  onOpenMessages,
  unreadMessageCount,
  isGlobalAdmin,
  onGoToGlobalAdmin,
  onOpenSettings,
}: MainPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Buchclub</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenMessages}
                className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Nachrichten"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                    {unreadMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Einstellungen"
              >
                <Settings className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span>{userName || 'Mitglied'}</span>
              </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Alle bewerteten Bücher
              </h2>
              <p className="text-sm text-gray-600">
                Klicken Sie auf den Titel, um alle Kommentare zu sehen
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isGlobalAdmin && (
                <button
                  onClick={onGoToGlobalAdmin}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  <Shield className="w-5 h-5" />
                  Administrator
                </button>
              )}
              <button
                onClick={onGoToGroups}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                <Users className="w-5 h-5" />
                Gruppen
              </button>
              <button
                onClick={onGoToPersonalBooks}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                <BookOpen className="w-5 h-5" />
                Meine Bücher
              </button>
            </div>
          </div>
          
          <BookTable books={books} onBookTitleClick={onBookTitleClick} />
        </div>
      </main>
    </div>
  );
}