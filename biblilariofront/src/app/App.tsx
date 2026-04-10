import { useRef , useState } from 'react';
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
import {BookGroup} from '@/data/mockGroups';
import { ChatMessage, Message } from '@/data/mockMessages';
import { API } from "../api";

import SockJS from 'sockjs-client';
  import { Client } from "@stomp/stompjs";
  import { useWebSocket, WebSocketProvider } from "./WebSocketContext";

type AuthView = 'login' | 'register' | 'main' | 'personal' | 'groups' | 'group-detail' | 'global-admin';

  type AppContentProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

function AppContent({ setIsLoggedIn }: AppContentProps) {



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
  const [users, setUsers] = useState<User[]>([]); // Admin
  const [invitableUsers, setInvitableUsers] = useState<User[]>([]); // Group
  const [role, setRole] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { clientRef, connected } = useWebSocket();

useEffect(() => {
  const client = clientRef.current;
  if (!client) return;

  if (!client.connected) return;

  const sub = client.subscribe("/user/queue/messages", (msg) => {
    const data = JSON.parse(msg.body);
    setMessages((prev) => [...prev, data]);
  });

  return () => sub.unsubscribe();
}, [clientRef.current?.connected]);

const filteredUsers = users.filter(
  (user) =>
    user.role !== "DELETED" &&
    (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
);

  const markGroupAsJoining = (groupId: string) => {
  setGroups(prev =>
    prev.map(group =>
      group.id === groupId
        ? { ...group, joining: true }
        : group
    )
  );
};


useEffect(() => {
  if (currentView !== 'global-admin') return;



  const token = localStorage.getItem('token');

  fetch(API.base + "/users", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Fehler beim Laden der User (Admin)');
      }
      return res.json();
    })
    .then((data: User[]) => {
      console.log("Admin Users:", data);
      setUsers(data); // 👈 HIER landen ALLE User für Admin Page
    })
    .catch((err) => {
      console.error(err);
    });

     // 👉 BOOK SUGGESTIONS laden
  fetch(API.base + "/books/suggest/getAll", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Fehler beim Laden der Book Suggestions');
      }
      return res.json();
    })
    .then((data) => {
      console.log("Book Suggestions:", data);
      setBookSuggestions(data); // 👉 brauchst du als State, falls noch nicht vorhanden
    })
    .catch((err) => {
      console.error(err);
    });
}, [currentView]);

useEffect(() => {
  // Läuft nur, wenn eine Gruppe ausgewählt ist
  if (!selectedGroupId) return;

  const token = localStorage.getItem('token');

  fetch(`${API.base}/api/groups/${selectedGroupId}/invitable-users`, {
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
      setInvitableUsers(data); // ersetzt die bestehende User-Liste
    })
    .catch(err => console.error(err));
}, [selectedGroupId]); // 🔑 useEffect wird neu ausgelöst, wenn sich die Gruppe ändert

useEffect(() => {
  if (currentView === 'groups') {

    const token = localStorage.getItem('token');

    fetch(`${API.base}/groups`, {
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
    fetch(`${API.base}/books`, {
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
    fetch(`${API.base}/messages/inbox`, {
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
    const isGlobalAdmin = role === "ADMIN";
    const isSuperAdmin = role === "SUPERADMIN";

  const handleLogin = (userId: string, userName: string, role: string) => {
    setCurrentUserId(userId);
    console.log("userId:", userId);
    setCurrentUserName(userName);
    setRole(role);
    setIsLoggedIn(true); 
    
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
    
    clientRef.current?.deactivate(); // ✅ jetzt bekannt
    localStorage.removeItem("token");
    setIsLoggedIn(false);

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
    const res = await fetch(`${API.base}/chat/group/${groupId}`, {
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
    const res = await fetch(`${API.base}/groups/${groupId}`, {
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
  setGroups(prev =>
    prev.map(group =>
      group.id === groupId
        ? { ...group, joining: true }
        : group
    )
  );
};

const handleLeaveGroup = async (groupId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Du bist nicht eingeloggt.");
    return;
  }

  try {
    const response = await fetch(`${API.base}/${groupId}/leave`, {
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
  const token = localStorage.getItem('token');

  // 🔥 1. Optimistic UI Update (sofort im Frontend)
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
                id: request.id, // 👈 angepasst (du hast kein userId mehr)
                name: request.name,
                email: request.email,
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

  // 🔥 2. API Call
  fetch(`${API.base}/groups/${groupId}/join-requests/${requestId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : '',
    },
  }).catch(() => {
    // ⚠️ Optional: rollback bei Fehler
    console.error("Fehler beim Annehmen der Anfrage");

    // einfacher rollback → neu laden wäre sauberer
  });
};

const handleRejectJoinRequest = (groupId: string, requestId: string) => {
  const token = localStorage.getItem('token');

  // 🔥 1. Optimistic UI Update
  setGroups(prev =>
    prev.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          joinRequests: g.joinRequests?.filter((r) => r.id !== requestId),
        };
      }
      return g;
    })
  );

  // 🔥 2. API Call
  fetch(`${API.base}/groups/${groupId}/join-requests/${requestId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Fehler beim Ablehnen");
    }
  })
  .catch(() => {
    console.error("Fehler beim Ablehnen der Anfrage");

    // ⚠️ Optional: rollback oder neu laden
  });
};

const handleRemoveMember = async (groupId: string, memberId: string) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API.base}/${groupId}/members/${memberId}`, {
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
    const res = await fetch(`${API.base}/${groupId}/transfer-admin/${memberId}`, {
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
    const res = await fetch(`${API.base}/${groupId}`, {
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
  fetch(`${API.base}/messages/send`, {
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

  fetch(`${API.base}/messages/${messageId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(err => console.error("Fehler beim Markieren:", err));
};

const handleToggleBlock = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
     `${API.base}/users/blocking/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Fehler");

    const data = await res.json();
    console.log("API response:", data);

    // 👇 HIER VORHER
    console.log("BEFORE UPDATE");

    setUsers((prev) => {
      const updated = prev.map((u) =>
        String(u.id) === String(userId)
          ? { ...u, role: u.role === "BLOCKED" ? "USER" : "BLOCKED" }
          : u
      );

      // 👇 DAS IST DER WICHTIGE DEBUG POINT
      console.log("AFTER MAP (NEW STATE):", updated);

      return updated;
    });

  } catch (err) {
    console.error(err);
  }
};

  const handleToggleAdmin = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API.base}/users/admin/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Fehler");

    const data = await res.json();
    console.log("API response:", data);

    // 👇 HIER VORHER
    console.log("BEFORE UPDATE");

    setUsers((prev) => {
      const updated = prev.map((u) =>
        String(u.id) === String(userId)
          ? { ...u, role: u.role === "ADMIN" ? "USER" : "ADMIN" }
          : u
      );

      // 👇 DAS IST DER WICHTIGE DEBUG POINT
      console.log("AFTER MAP (NEW STATE):", updated);

      return updated;
    });

  } catch (err) {
    console.error(err);
  }
  };

const handleDeleteUser = async (userId: string) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
     `${API.base}/users/admin/${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      alert(err.message || "Fehler");
      return;
    }

    // 🔥 Optimistic UI update
    setUsers(users.filter((u) => u.id !== userId));

    alert("Account erfolgreich gelöscht (Soft Delete).");
  } catch (err) {
    console.error(err);
    alert("Serverfehler");
  }
};

const handleAddBook = (bookData: any) => {

};


const handleCreateGroup = async (name: string, description: string, isPrivate: boolean) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API.base}/groups`, {
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
    const groupResponse = await fetch(`${API.base}/groups/${backendGroup.id}`, {
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

  const handleApproveSuggestion = (bookData: any) => {
  console.log('Adding book to database:', bookData);

  const token = localStorage.getItem("token"); // falls du JWT nutzt
  const isbn = bookData.isbn; // wichtig: muss existieren!

  fetch(API_URL+`/books/suggest/register/${isbn}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Fehler beim Übernehmen der Suggestion");
      }
      return res.text(); // oder .json() je nach Backend
    })
    .then((data) => {
      console.log("Erfolg:", data);
      alert(`Buch "${bookData.title}" wurde zur Datenbank hinzugefügt!`);
    })
    .catch((err) => {
      console.error(err);
      alert("Fehler beim Hinzufügen des Buchs");
    });
  };

const handleRejectSuggestion = (bookData: any) => {
  const token = localStorage.getItem("token");
  const isbn = bookData.isbn;

  fetch(`${API.base}/books/suggest/register/${isbn}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Fehler beim Löschen der Suggestion");
      }
      return res.text(); // oder .json()
    })
    .then((data) => {
      console.log("Gelöscht:", data);

    })
    .catch((err) => {
      console.error(err);
      alert("Fehler beim Löschen der Suggestion");
    });
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
    const res = await fetch(`${API.base}/${groupId}/toggle-privacy`, {
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
    const res = await fetch(`${API.base}/messages/invitations`, {
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
          currentUserId={currentUserId}
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
          availableUsers={invitableUsers}
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
          bookSuggestionsIn={bookSuggestions}
          onApproveSuggestion={handleApproveSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          filteredUsers={filteredUsers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <WebSocketProvider isLoggedIn={isLoggedIn}>
       <AppContent setIsLoggedIn={setIsLoggedIn} />
    </WebSocketProvider>
  );
}