import { useState } from 'react';
import { useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { RegisterPage } from '@/app/components/RegisterPage';
import { MainPage } from '@/app/components/MainPage';
import { PersonalBooksPage } from '@/app/components/PersonalBooksPage';
import { GroupsMenuPage } from '@/app/components/GroupsMenuPage';
import { GroupDetailPage } from '@/app/components/GroupDetailPage';
import { GlobalAdminPage } from '@/app/components/GlobalAdminPage';
import { CommentsModal } from '@/app/components/CommentsModal';
import { MessagesModal } from '@/app/components/MessagesModal';
import { SettingsModal } from '@/app/components/SettingsModal';
import { Book } from '@/app/components/BookTable';
import { mockBooks } from '@/data/mockBooks';
import { ChatMessage, Message } from '@/data/mockMessages';

type AuthView = 'login' | 'register' | 'main' | 'personal' | 'groups' | 'group-detail' | 'global-admin';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE');
};
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [groups, setGroups] = useState<BookGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);

useEffect(() => {
  // Läuft nur, wenn eine Gruppe ausgewählt ist
  if (!selectedGroupId) return;

  const token = localStorage.getItem('token');

  fetch(`http://localhost:8080/api/groups/${selectedGroupId}/invitable-users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Fehler beim Laden der invitable Users');
      }
      return res.json();
    })
    .then((data) => {
      console.log("Invitable Users vom Backend:", data);
      setUsers(data); // ersetzt die bestehende User-Liste
    })
    .catch(err => console.error(err));
}, [selectedGroupId]); // 🔑 useEffect wird neu ausgelöst, wenn sich die Gruppe ändert

useEffect(() => {
  if (currentView === 'groups') {

    const token = localStorage.getItem('token');

    fetch('http://localhost:8080/groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Fehler beim Laden der Gruppen');
        }
        return res.json();
      })
      .then((data) => {
        console.log("Groups vom Backend:", data);

  const allGroups = [
    ...data.myGroups.map(g => ({
      ...g,
      isPrivate: g.private,
      isJoined: true
    })),
    ...data.availableGroups.map(g => ({
      ...g,
      isPrivate: g.private,
      isJoined: false
    }))
  ];

        setGroups(allGroups);
      })
      .catch(err => console.error(err));
  }
}, [currentView]);

useEffect(() => {
  if (currentView === 'main') {
    const token = localStorage.getItem('token');

    // Bücher laden
    fetch('http://localhost:8080/books', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Nicht autorisiert oder Serverfehler');
        return res.json();
      })
      .then((data: Book[]) => {
        console.log("Backend Antwort Bücher:", data);
        setBooks(data);
      })
      .catch(err => console.error('Fehler beim Laden der Bücher:', err));

    // Ungelesene Nachrichten laden
    fetch('http://localhost:8080/messages/inbox', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Nachrichten');
        return res.json();
      })
      .then((data: Message[]) => {
        console.log("Backend Antwort Nachrichten:", data);
        setMessages(data);
      })
      .catch(err => console.error('Fehler beim Laden der Nachrichten:', err));
  }
}, [currentView]);

const unreadMessageCount = messages.filter(
  (m) => !m.isRead && m.receiverName === currentUserName
).length;
const inboxMessages = messages;

  const currentUserData = users.find((u) => u.id === currentUserId);
  const isGlobalAdmin = currentUserData?.isGlobalAdmin || false;
  const isSuperAdmin = currentUserData?.isSuperAdmin || false;

  const handleLogin = (userId: string, userName: string, role: string) => {
    setCurrentUserId(userId);
    console.log("userId:", userId);
    setCurrentUserName(userName);
    setRole(role);
    
    // Check if user is admin or superadmin - they go directly to admin page
  if (role === "ADMIN" || role === "SUPERADMIN") {
    setCurrentView("global-admin");
  } else {
    setCurrentView("main");
  }
  };

  const handleRegister = (userId: string, userName: string) => {
    setCurrentUserId(userId);
    setCurrentUserName(userName);
      setCurrentView('main'); // 🔥 DAS FEHLT
  };

  const handleLogout = () => {
    setCurrentUserId('');
    setCurrentUserName('');
    setCurrentView('login');
  };

  const handleBookTitleClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };


  const loadGroupMessages = async (groupId: number) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:8080/chat/group/${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Fehler beim Laden der Nachrichten');

    const messages: ChatMessage[] = await res.json();

    setGroupMessages(messages);

  } catch (error) {
    console.error(error);
  }
};

const handleGroupClick = async (groupId: number) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:8080/groups/${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Fehler beim Laden der Gruppe');

    const groupData = await res.json();
    console.log("Backend groupData:", groupData);
    // Optional: setze isJoined, falls nicht vom Backend gesetzt
    setGroups((prevGroups) =>
      prevGroups.map((g) =>
        g.id === groupData.id ? { ...groupData, isJoined: g.isJoined } : g
      )
    );

    setSelectedGroupId(groupData.id);
        // ⭐ CHAT NACHRICHTEN LADEN
    await loadGroupMessages(groupData.id);

    setCurrentView('group-detail');
  } catch (error) {
    console.error(error);
  }
};

  const handleJoinRequest = (groupId: string) => {
    // In real app, send join request to backend
    console.log('Join request sent for group:', groupId);
  };

const handleLeaveGroup = async (groupId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Du bist nicht eingeloggt.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/${groupId}/leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Fehler beim Verlassen der Gruppe");
    }

    // Lokalen State aktualisieren
    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, isJoined: false } : g
      )
    );

    setCurrentView('groups');
    alert("Du hast die Gruppe verlassen.");
  } catch (error) {
    console.error(error);
    alert("Die Gruppe konnte nicht verlassen werden.");
  }
};

  const handleAcceptJoinRequest = (groupId: string, requestId: string) => {
    setGroups(
      groups.map((g) => {
        if (g.id === groupId) {
          const request = g.joinRequests?.find((r) => r.id === requestId);
          if (request) {
            return {
              ...g,
              members: [
                ...(g.members || []),
                {
                  id: request.userId,
                  name: request.userName,
                  email: request.userEmail,
                  joinedDate: new Date().toLocaleDateString('de-DE'),
                  isAdmin: false,
                },
              ],
              joinRequests: g.joinRequests?.filter((r) => r.id !== requestId),
              memberCount: g.memberCount + 1,
            };
          }
        }
        return g;
      })
    );
  };

  const handleRejectJoinRequest = (groupId: string, requestId: string) => {
    setGroups(
      groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            joinRequests: g.joinRequests?.filter((r) => r.id !== requestId),
          };
        }
        return g;
      })
    );
  };

const handleRemoveMember = async (groupId: string, memberId: string) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:8080/${groupId}/members/${memberId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Mitglied konnte nicht entfernt werden");

    // Gruppe neu laden, damit UI aktualisiert wird
    await  handleGroupClick(Number(groupId));

    console.log(`Mitglied ${memberId} entfernt`);
  } catch (err) {
    console.error(err);
    alert("Fehler beim Entfernen des Mitglieds");
  }
};

const handleTransferAdmin = async (groupId: string, memberId: string) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:8080/${groupId}/transfer-admin/${memberId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Admin-Rechte konnten nicht übertragen werden");

    // Gruppe neu laden
    await  handleGroupClick(Number(groupId));

    console.log(`Admin-Rechte an ${memberId} übertragen`);
  } catch (err) {
    console.error(err);
    alert("Fehler beim Übertragen der Admin-Rechte");
  }
};

const handleDeleteGroup = async (groupId: string) => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Nicht angemeldet.");

  // Optional: Bestätigung anzeigen
  const confirmDelete = window.confirm(
    "Willst du diese Gruppe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
  );
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:8080/${groupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Fehler beim Löschen der Gruppe");
    }

    // Lokaler State aktualisieren
    setGroups(groups.filter((g) => g.id !== groupId));
    setCurrentView("groups");

    alert("Gruppe erfolgreich gelöscht");
  } catch (err) {
    console.error(err);
    alert("Fehler beim Löschen der Gruppe: " + (err instanceof Error ? err.message : err));
  }
};

const handleSendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
  // 1️⃣ Erzeuge direkt ein Frontend-Objekt mit allen nötigen Feldern
  const newMessage: Message = {
    ...message,
    id: Date.now(), // temporäre ID bis Backend antwortet
    timestamp: new Date().toISOString(),
    isRead: false,
    invitation: false,
    groupId: null,
  };

  // 2️⃣ Direkt zum State hinzufügen, damit es sofort im Gesendet-Ordner erscheint
  setMessages(prev => [...prev, newMessage]);

  // 3️⃣ Nachricht parallel ans Backend senden
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...message,
      senderName: currentUserName,      // Name des Absenders
      receiverName: message.receiverName, // Name des Empfängers
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error("Fehler beim Senden der Nachricht");
      return res.json();
    })
    .then(serverMessage => {
      // Optional: wenn Backend eine ID liefert, aktualisiere die temporäre ID
      setMessages(prev =>
        prev.map(msg => (msg.id === newMessage.id ? { ...msg, id: serverMessage.id } : msg))
      );
    })
    .catch(err => {
      console.error(err);
      alert("Nachricht konnte nicht gesendet werden.");
      // Optional: Nachricht wieder aus State entfernen, wenn fehlerhaft
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    });
};
  const handleMarkAsRead = (messageId: string) => {
    const token = localStorage.getItem("token");

  fetch(`http://localhost:8080/messages/${messageId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(err => console.error("Fehler beim Markieren:", err));
};

  const handleToggleBlock = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
      )
    );
  };

  const handleToggleAdmin = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, isGlobalAdmin: !u.isGlobalAdmin } : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleAddBook = (bookData: any) => {
    console.log('Adding book to database:', bookData);
    // In real app, add to backend
    alert(`Buch "${bookData.title}" wurde zur Datenbank hinzugefügt!`);
  };
const handleCreateGroup = async (name: string, description: string, isPrivate: boolean) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8080/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, isPrivate }),
    });

    if (!response.ok) {
      console.error('Fehler beim Erstellen der Gruppe im Backend');
      return;
    }

    const backendGroup = await response.json();

    // 🔥 Gruppe erneut vollständig laden
    const groupResponse = await fetch(`http://localhost:8080/groups/${backendGroup.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fullGroup = await groupResponse.json();

    setGroups([...groups, fullGroup]);

    setSelectedGroupId(fullGroup.id);
    setCurrentView('group-detail');

  } catch (error) {
    console.error('Fehler beim Erstellen der Gruppe:', error);
  }
};

  const handleAddBookToGroup = (groupId: string, bookData: any) => {
    console.log('Adding book to group:', groupId, bookData);
    // In real app, add to backend
    alert(`Buch "${bookData.title}" wurde zur Gruppe hinzugefügt!`);
  };

  const handleSuggestBook = (bookData: any) => {
    // Send message to all admins about book suggestion
    const admins = users.filter((u) => u.isGlobalAdmin || u.isSuperAdmin);
    admins.forEach((admin) => {
      const suggestionMessage: Message = {
        id: `m${Date.now()}-${admin.id}`,
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: admin.id,
        receiverName: admin.name,
        subject: 'Neuer Buchvorschlag',
        content: `${currentUserName} hat ein neues Buch vorgeschlagen.`,
        timestamp: new Date().toLocaleString('de-DE'),
        isRead: false,
        type: 'book-suggestion',
        bookData: {
          isbn: bookData.isbn,
          title: bookData.title,
          authors: bookData.authors,
          publishedDate: bookData.publishedDate,
          language: bookData.language,
          description: bookData.description || '',
        },
        status: 'pending',
      };
      setMessages((prev) => [...prev, suggestionMessage]);
    });
  };

  const handleApproveSuggestion = (messageId: string, bookData: any) => {
    // Mark suggestion as approved and add book
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, status: 'approved' as const } : m
      )
    );
    handleAddBook(bookData);
  };

  const handleRejectSuggestion = (messageId: string) => {
    // Mark suggestion as rejected
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, status: 'rejected' as const } : m
      )
    );
  };

  const handleChangeEmail = (newEmail: string) => {
    // In real app, update email in backend
    setUsers(
      users.map((u) =>
        u.id === currentUserId ? { ...u, email: newEmail } : u
      )
    );
    console.log('Email changed to:', newEmail);
  };

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    // In real app, verify current password and update in backend
    console.log('Password changed successfully');
  };

  const handleDeleteAccount = (password: string) => {
    // In real app, verify password and delete account from backend
    const userToDelete = users.find((u) => u.id === currentUserId);
    if (confirm(`Möchten Sie Ihr Konto "${userToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      setUsers(users.filter((u) => u.id !== currentUserId));
      handleLogout();
    }
  };

const handleTogglePrivacy = async (groupId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:8080/${groupId}/toggle-privacy`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Privatsphäre konnte nicht geändert werden');
    }

    // Hier kein JSON, sondern Text
    const message = await res.text();
    alert(message);

    // Optional: UI updaten (wenn du isPrivate trotzdem in groups speichern willst)
    setGroups(
      groups.map(g => g.id === groupId ? { ...g, isPrivate: !g.isPrivate } : g)
    );

        // Gruppe neu laden, damit UI aktualisiert wird
    await  handleGroupClick(Number(groupId));

  } catch (err: any) {
    console.error(err);
    alert('Fehler beim Ändern der Privatsphäre: ' + err.message);
  }
};

const handleInviteUser = async (groupId: string, userId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Anfrage an das Backend
    const res = await fetch(`http://localhost:8080/messages/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipientId: userId,
        groupId: groupId,
        invitation: true,
        // Optional: subject und content leer lassen, Backend erstellt automatisch
        subject: '',
        content: ''
      }),
    });

    if (!res.ok) {
      throw new Error('Fehler beim Versenden der Einladung');
    }

    const createdMessage = await res.json();
    console.log('Einladung erstellt:', createdMessage);

    // Optional: lokal hinzufügen, damit UI direkt reagiert
    setMessages(prev => [...prev, createdMessage]);
    
    alert('Einladung erfolgreich verschickt!');
  } catch (err: any) {
    console.error(err);
    alert('Fehler beim Versenden der Einladung: ' + err.message);
  }
};

  const bookSuggestions = messages.filter((m) => m.type === 'book-suggestion');

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  return (
    <div className="size-full">
      {currentView === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      )}
      
      {currentView === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
      
{currentView === 'main' && (
  <>
    <MainPage
      books={books}
      onBookTitleClick={handleBookTitleClick}
      onLogout={handleLogout}
      userName={currentUserName}
      onGoToPersonalBooks={() => setCurrentView('personal')}
      onGoToGroups={() => setCurrentView('groups')}
      onOpenMessages={() => setShowMessages(true)}
      unreadMessageCount={unreadMessageCount}
      isGlobalAdmin={isGlobalAdmin}
      onGoToGlobalAdmin={() => setCurrentView('global-admin')}
      onOpenSettings={() => setShowSettings(true)}
    />

    <div className="p-4">
      {inboxMessages.map((m) => (
        <div key={m.id} className="text-sm text-gray-700">
          {m.subject} - {m.sender} - {formatDate(m.sentAt)}
        </div>
      ))}
    </div>
  </>
)}
      
      {currentView === 'personal' && (
        <PersonalBooksPage
          onBack={() => setCurrentView('main')}
          userName={currentUserName}
          allBooks={mockBooks}
          onSuggestBook={handleSuggestBook}
        />
      )}
      
      {currentView === 'groups' && (
        <GroupsMenuPage
          onBack={() => setCurrentView('main')}
          groups={groups}
          onGroupClick={handleGroupClick}
          onJoinRequest={handleJoinRequest}
          onCreateGroup={handleCreateGroup}
        />
      )}
      
      {currentView === 'group-detail' && selectedGroup && (
        <GroupDetailPage
          group={selectedGroup}
          reloadGroup={() => handleGroupClick(selectedGroup.id)}
          onBack={() => setCurrentView('groups')}
          onLeaveGroup={handleLeaveGroup}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onAcceptJoinRequest={handleAcceptJoinRequest}
          onRejectJoinRequest={handleRejectJoinRequest}
          onRemoveMember={handleRemoveMember}
          onTransferAdmin={handleTransferAdmin}
          onDeleteGroup={handleDeleteGroup}
          onAddBookToGroup={(bookData) => handleAddBookToGroup(selectedGroup.id, bookData)}
          onTogglePrivacy={handleTogglePrivacy}
          onInviteUser={handleInviteUser}
          availableUsers={users}
        />
      )}
      
      {currentView === 'global-admin' && (
        <GlobalAdminPage
          onLogout={handleLogout}
          users={users}
          currentUserId={currentUserId}
          currentUserIsSuperAdmin={isSuperAdmin}
          onToggleBlock={handleToggleBlock}
          onToggleAdmin={handleToggleAdmin}
          onDeleteUser={handleDeleteUser}
          onAddBook={handleAddBook}
          bookSuggestions={bookSuggestions}
          onApproveSuggestion={handleApproveSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      
      <CommentsModal book={selectedBook} onClose={handleCloseModal} />
      
      <MessagesModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        messages={messages}
        currentUserId={currentUserId}
          currentUserName={currentUserName}  
        onSendMessage={handleSendMessage}
        onMarkAsRead={handleMarkAsRead}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentEmail={currentUserData?.email || ''}
        onChangeEmail={handleChangeEmail}
        onChangePassword={handleChangePassword}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}