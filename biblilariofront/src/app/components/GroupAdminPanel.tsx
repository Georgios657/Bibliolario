import { useState } from "react";
import {
  X,
  UserMinus,
  Shield,
  Trash2,
  Check,
  XIcon,
  Lock,
  LockOpen,
  UserPlus,
  Mail,
} from "lucide-react";
import { GroupMember, JoinRequest } from "@/data/mockGroups";

interface GroupAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  members: GroupMember[];
  joinRequests: JoinRequest[];
  currentUserId: string;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onRemoveMember: (memberId: string) => void;
  onTransferAdmin: (memberId: string) => void;
  onDeleteGroup: () => void;
  isPrivate?: boolean;
  onTogglePrivate: () => void;
  availableUsers?: Array<{ id: string; name: string; email: string }>;
  onInviteUser: (userId: string) => void;
}

export function GroupAdminPanel({
  isOpen,
  onClose,
  groupName,
  members,
  joinRequests,
  currentUserId,
  onAcceptRequest,
  onRejectRequest,
  onRemoveMember,
  onTransferAdmin,
  onDeleteGroup,
  isPrivate,
  onTogglePrivate,
  availableUsers,
  onInviteUser,
}: GroupAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "requests" | "members" | "invite" | "danger"
  >("requests");
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);
  const [showTransferConfirm, setShowTransferConfirm] =
    useState<string | null>(null);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const toggleButtonClasses = `flex items-center gap-2 px-6 py-2 rounded-md transition-colors font-medium ml-4 ${
    isPrivate
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-600 text-white hover:bg-gray-700"
  }`;

  // Filter users who are not already members
  const memberIds = members.map(m => m.id);
  const nonMembers = (availableUsers || []).filter(u => !memberIds.includes(u.id));
  const filteredNonMembers = nonMembers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteUser = (userId: string) => {
    setInvitedUsers([...invitedUsers, userId]);
    onInviteUser(userId);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Admin-Funktionen
            </h2>
            <p className="text-sm text-purple-100">
              {groupName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-700 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "requests"
                  ? "border-b-2 border-purple-600 text-purple-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Beitrittsanfragen
              {joinRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {joinRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "members"
                  ? "border-b-2 border-purple-600 text-purple-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Mitglieder verwalten
            </button>

            <button
              onClick={() => setActiveTab("invite")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "invite"
                  ? "border-b-2 border-purple-600 text-purple-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Benutzer einladen
            </button>

            <button
              onClick={() => setActiveTab("danger")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "danger"
                  ? "border-b-2 border-red-600 text-red-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              Gefahrenzone
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "requests" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Offene Beitrittsanfragen
              </h3>
              {joinRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Keine offenen Anfragen
                </p>
              ) : (
                joinRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">
                            {request.userName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {request.userEmail}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Anfrage vom: {request.requestDate}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => onAcceptRequest(request.id)}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                          title="Annehmen"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onRejectRequest(request.id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Ablehnen"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

{activeTab === "members" && (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800 mb-3">
      Mitglieder ({members.length})
    </h3>
    {members
      .filter((member) => member.name !== currentUserId) // <-- sich selbst ausblenden
      .map((member) => (
        <div
          key={member.id}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800">
                  {member.name}
                </h4>
                {member.isAdmin && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{member.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Beigetreten: {member.joinedDate}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              {!member.isAdmin && (
                <button
                  onClick={() => setShowTransferConfirm(member.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md transition-colors text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin übertragen
                </button>
              )}
              <button
                onClick={() => onRemoveMember(member.id)}
                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                title="Mitglied entfernen"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
  </div>
)}

          {activeTab === "invite" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Benutzer einladen
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Laden Sie Benutzer direkt in Ihre Gruppe ein. Sie erhalten eine Benachrichtigung und können der Gruppe beitreten.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* User List */}
              {filteredNonMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery
                    ? "Keine Benutzer gefunden"
                    : "Alle verfügbaren Benutzer sind bereits Mitglieder"}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredNonMembers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {user.name}
                        </h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleInviteUser(user.id)}
                        disabled={invitedUsers.includes(user.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium text-sm ${
                          invitedUsers.includes(user.id)
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        {invitedUsers.includes(user.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            Eingeladen
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Einladen
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-4">
              {/* Privacy Toggle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      {isPrivate ? (
                        <>
                          <Lock className="w-5 h-5" />
                          Private Gruppe
                        </>
                      ) : (
                        <>
                          <LockOpen className="w-5 h-5" />
                          Öffentliche Gruppe
                        </>
                      )}
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      {isPrivate
                        ? "Diese Gruppe ist privat und erscheint nicht in der globalen Suche. Nur eingeladene Mitglieder können beitreten."
                        : "Diese Gruppe ist öffentlich und erscheint in der globalen Suche. Benutzer können eine Beitrittsanfrage senden."}
                    </p>
                  </div>

                  <button
                    onClick={onTogglePrivate}
                    className={toggleButtonClasses}
                  >
                    {isPrivate ? (
                      <>
                        <LockOpen className="w-4 h-4" />
                        Öffentlich machen
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Privat machen
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Delete Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Gruppe auflösen
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Diese Aktion kann nicht rückgängig gemacht
                  werden. Alle Daten dieser Gruppe werden
                  unwiderruflich gelöscht.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Gruppe dauerhaft löschen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Gruppe wirklich löschen?
            </h2>
            <p className="text-gray-600 mb-6">
              Möchten Sie die Gruppe "{groupName}" wirklich unwiderruflich löschen?
              Alle Mitglieder verlieren den Zugriff und alle Gruppendaten werden
              gelöscht.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteGroup();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Ja, endgültig löschen
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Admin Confirmation Modal */}
      {showTransferConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
          onClick={() => setShowTransferConfirm(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Admin-Rechte übertragen?
            </h2>
            <p className="text-gray-600 mb-6">
              Möchten Sie die Admin-Rechte für die Gruppe "{groupName}" an{' '}
              {members.find((m) => m.id === showTransferConfirm)?.name} übertragen?
              Sie verlieren dadurch Ihre Admin-Rechte.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onTransferAdmin(showTransferConfirm);
                  setShowTransferConfirm(null);
                }}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                Ja, übertragen
              </button>
              <button
                onClick={() => setShowTransferConfirm(null)}
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