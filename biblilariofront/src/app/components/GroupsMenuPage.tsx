import { useState } from 'react';
import { ArrowLeft, Search, Users, Book, UserPlus, Check, PlusCircle } from 'lucide-react';
import { BookGroup } from '@/data/mockGroups';

interface GroupsMenuPageProps {
  onBack: () => void;
  groups: BookGroup[];
  currentUserId: string;
  onGroupClick: (groupId: string) => void;
  onJoinRequest: (groupId: string) => void;
  onCreateGroup: (name: string, description: string, isPrivate: boolean) => void;
}

export function GroupsMenuPage({
  onBack,
  groups,
  currentUserId,
  onGroupClick,
  onJoinRequest,
  onCreateGroup,
}: GroupsMenuPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const myGroups = groups.filter((g) => g.isJoined);
  const otherGroups = groups.filter((g) => !g.isJoined && !g.isPrivate); // Filter out private groups

  const filteredOtherGroups = otherGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

const handleJoinRequest = (groupId: string) => {
  const token = localStorage.getItem('token');

  fetch(`http://localhost:8080/${groupId}/join-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      userId: currentUserId,
    }),
  }).then(() => {
    onJoinRequest(groupId); // 🔥 wichtig: Daten neu laden
  });
};

const handleCreateGroup = () => {
  if (newGroupName.trim() && newGroupDescription.trim()) {
    onCreateGroup(newGroupName, newGroupDescription, isPrivate);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsPrivate(false);
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
                Zurück zur Übersicht
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Buchgruppen</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              Neue Gruppe erstellen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Groups Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Meine Gruppen ({myGroups.length})
          </h2>

          {myGroups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Sie sind noch keiner Gruppe beigetreten
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onGroupClick(group.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-indigo-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {group.name}
                    </h3>
                    <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      Mitglied
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} Mitglieder</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      <span>{group.bookCount} Bücher</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Join Groups Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Gruppen beitreten
          </h2>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Suche nach Gruppenname oder Schlüsselwort..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Available Groups */}
          {filteredOtherGroups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery
                ? 'Keine Gruppen gefunden'
                : 'Alle verfügbaren Gruppen wurden bereits beigetreten'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredOtherGroups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount} Mitglieder</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Book className="w-4 h-4" />
                          <span>{group.bookCount} Bücher</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Erstellt: {group.createdDate}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRequest(group.id)}
                      disabled={group.joining}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ml-4 ${
                        group.joining
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {group.joining ? (
                        <>
                          <Check className="w-4 h-4" />
                          Anfrage gesendet
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Beitritt anfragen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

{/* Create Group Modal */}
{showCreateModal && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 w-96">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Neue Gruppe erstellen</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Gruppenname"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <textarea
          placeholder="Beschreibung"
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-24"
        />
        {/* Privat/Öffentlich Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isPrivate" className="text-gray-700 text-sm">Privat (nur eingeladene Mitglieder)</label>
        </div>
      </div>
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={() => setShowCreateModal(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
        >
          Abbrechen
        </button>
        <button
          onClick={handleCreateGroup}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors font-medium"
        >
          Erstellen
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}