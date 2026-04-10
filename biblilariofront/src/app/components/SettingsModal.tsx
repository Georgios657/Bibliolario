import { useEffect, useState } from 'react';
import { Settings, Mail, Lock, Trash2, X } from 'lucide-react';
import { API } from "../../api";


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'password' | 'delete'>('email');
  
  // 🔹 User Data
  const [currentEmail, setCurrentEmail] = useState('');

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const resetForms = () => {
    setNewEmail('');
    setEmailPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
    setDeleteConfirmText('');
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  // 🔹 Fetch current user email when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API.base}/api/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.email) setCurrentEmail(data.email);
      })
      .catch(err => console.error('Fehler beim Laden der Userdaten:', err));
  }, [isOpen]);

  const handleEmailChange = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Du bist nicht eingeloggt! Bitte melde dich erneut an.");
      return;
    }

    if (!newEmail || !emailPassword) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (!newEmail.includes("@")) {
      alert("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    try {
      const response = await fetch("/api/user/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail,
          password: emailPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Fehler beim Ändern der E-Mail");
        return;
      }

      alert("E-Mail erfolgreich geändert!");
      setCurrentEmail(newEmail); // 🔹 Live update
      setNewEmail("");
      setEmailPassword("");

    } catch (err) {
      console.error(err);
      alert("Serverfehler beim Ändern der E-Mail");
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Du bist nicht eingeloggt! Bitte neu anmelden.");
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Fehler beim Ändern des Passworts');
        return;
      }

      alert('Passwort erfolgreich geändert!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert('Serverfehler beim Ändern des Passworts');
    }
  };

  // 🔹 Soft Delete
  const handleDeleteAccount = async () => {
    if (!deletePassword) { alert('Bitte geben Sie Ihr Passwort ein.'); return; }
    if (deleteConfirmText.toLowerCase() !== 'löschen') { alert('Bitte geben Sie "LÖSCHEN" ein.'); return; }

    const token = localStorage.getItem('token');
    if (!token) { alert("Du bist nicht eingeloggt!"); return; }

    // 🔹 Generate random password
    const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2,'0')).join('');

    try {
      const response = await fetch(`${API.base}/api/user/soft-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          newEmail: `deleted_${Date.now()}@deleted.local`,
          newName: 'deleted',
          newPassword: randomPassword
        })
      });
      if (!response.ok) { const err = await response.json(); alert(err.message || 'Fehler'); return; }

      alert('Konto erfolgreich gelöscht (Soft Delete). Du wirst abgemeldet.');
      localStorage.removeItem('token');
      window.location.reload();
    } catch (err) { console.error(err); alert('Serverfehler'); }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Kontoeinstellungen</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            E-Mail ändern
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            Passwort ändern
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'delete'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Konto löschen
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">E-Mail-Adresse ändern</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ihre aktuelle E-Mail-Adresse: <span className="font-medium">{currentEmail}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neue E-Mail-Adresse</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="neue@email.de"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aktuelles Passwort zur Bestätigung</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Ihr aktuelles Passwort"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handleEmailChange}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                E-Mail ändern
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Passwort ändern</h3>
                <p className="text-sm text-gray-600 mb-4">Ihr neues Passwort muss mindestens 6 Zeichen lang sein.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aktuelles Passwort</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ihr aktuelles Passwort"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neues Passwort</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Neues Passwort (mindestens 6 Zeichen)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neues Passwort bestätigen</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Neues Passwort wiederholen"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Passwort ändern
              </button>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Achtung: Diese Aktion kann nicht rückgängig gemacht werden!
                </h3>
                <p className="text-sm text-red-700">
                  Wenn Sie Ihr Konto löschen, werden alle Ihre Daten unwiderruflich entfernt.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Konto löschen
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passwort zur Bestätigung</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Ihr Passwort"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Geben Sie "LÖSCHEN" ein, um zu bestätigen</label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="LÖSCHEN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      Konto endgültig löschen
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}