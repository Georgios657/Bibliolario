import { useState } from 'react';
import { X, Send, Mail, MailOpen, ArrowLeft, Plus } from 'lucide-react';
import { Message } from '@/data/mockMessages';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  currentUserId: string;
    currentUserName: string;  // <-- hier hinzufügen
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  onMarkAsRead: (messageId: string) => void;
}

export function MessagesModal({
  isOpen,
  onClose,
  messages,
  currentUserId,
    currentUserName,  // <-- hier hinzufügen
  onSendMessage,
  onMarkAsRead,
}: MessagesModalProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
const [newMessage, setNewMessage] = useState({
  receiverName: '',
  subject: '',
  content: '',
});
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  if (!isOpen) return null;

console.log("currentUserName:", currentUserName);
console.log("all messages:", messages);
const inbox = messages.filter((m) => m.receiverName === currentUserName);
console.log("inbox:", inbox);

const sent = messages.filter(
  (m) => m.senderName === currentUserName
);

  const unreadCount = inbox.filter((m) => !m.isRead).length;

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      onMarkAsRead(message.id);
          message.isRead = true;
    }
  };

  const handleSendNewMessage = () => {
    if (newMessage.receiverName && newMessage.subject && newMessage.content) {
        onSendMessage({
          senderName: currentUserId,
          receiverName: newMessage.receiverName,
          subject: newMessage.subject,
          content: newMessage.content,
        });
      setNewMessage({ receiverName: '', subject: '', content: '' });
      setIsComposing(false);
      setActiveTab('sent');
    }
  };

const handleReply = (message: Message) => {
  setNewMessage({
    receiverName: message.senderName,
    subject: `Re: ${message.subject}`,
    content: '',
  });

  setIsComposing(true);
  setSelectedMessage(null);
};

  const displayMessages = activeTab === 'inbox' ? inbox : sent;

const handleAcceptInvitation = (message: Message) => {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:8080/messages/${message.id}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {
    alert("Einladung angenommen");
    onClose();
  })
  .catch(err => console.error(err));
};

const handleDeclineInvitation = (message: Message) => {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:8080/messages/${message.id}/decline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {
    alert("Einladung abgelehnt");
    onClose();
  })
  .catch(err => console.error(err));
};


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(selectedMessage || isComposing) && (
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setIsComposing(false);
                }}
                className="p-1 hover:bg-indigo-700 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold">Nachrichten</h2>
            {unreadCount > 0 && !selectedMessage && !isComposing && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount} neu
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {!selectedMessage && !isComposing ? (
            <>
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
                <button
                  onClick={() => setIsComposing(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Neue Nachricht
                </button>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left ${
                      activeTab === 'inbox'
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    Posteingang
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left ${
                      activeTab === 'sent'
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Gesendet
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto">
                {displayMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Keine Nachrichten
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {displayMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !message.isRead && activeTab === 'inbox'
                            ? 'bg-indigo-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {activeTab === 'inbox' && !message.isRead ? (
                            <Mail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                          ) : (
                            <MailOpen className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p
                                className={`font-medium text-gray-800 truncate ${
                                  !message.isRead && activeTab === 'inbox'
                                    ? 'font-bold'
                                    : ''
                                }`}
                              >
                                {activeTab === 'inbox'
                                  ? message.senderName
                                  : message.receiverName}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p
                              className={`text-sm text-gray-700 mb-1 ${
                                !message.isRead && activeTab === 'inbox'
                                  ? 'font-semibold'
                                  : ''
                              }`}
                            >
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : selectedMessage ? (
            /* Message Detail View */
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedMessage.subject}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">
                    {activeTab === 'inbox' ? 'Von:' : 'An:'}
                  </span>
                  <span>
                    {activeTab === 'inbox'
                      ? selectedMessage.senderName
                      : selectedMessage.receiverName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{selectedMessage.timestamp}</span>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
{activeTab === 'inbox' && (
  <div className="p-4 border-t border-gray-200 flex gap-3">

    {selectedMessage.invitation ? (
      <>
        <button
          onClick={() => handleAcceptInvitation(selectedMessage)}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Annehmen
        </button>

        <button
          onClick={() => handleDeclineInvitation(selectedMessage)}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Ablehnen
        </button>
      </>
    ) : (
      <button
        onClick={() => handleReply(selectedMessage)}
        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
      >
        Antworten
      </button>
    )}

  </div>
)}
            </div>
          ) : (
            /* Compose New Message */
            <div className="flex-1 flex flex-col p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Neue Nachricht
              </h3>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    An
                  </label>
                  <input
                    type="text"
                    value={newMessage.receiverName}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, receiverName: e.target.value })
                    }
                    placeholder="Empfängername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betreff
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, subject: e.target.value })
                    }
                    placeholder="Betreff"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nachricht
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                    placeholder="Ihre Nachricht..."
                    rows={10}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSendNewMessage}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  Senden
                </button>
                <button
                  onClick={() => {
                    setIsComposing(false);
                    setNewMessage({
                    receiverName: '',
                    subject: '',
                    content: ''
                  });
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
    </div>
  );
}