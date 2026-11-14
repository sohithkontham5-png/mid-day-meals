import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../lib/storage';
import { X, KeyRound, ArrowLeft, Search, ShieldCheck } from 'lucide-react';

interface LoginPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser: User;
}

export const LoginPinModal: React.FC<LoginPinModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setPin('');
    setErrorMsg('');
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4 && selectedUser) {
        verifyPin(newPin, selectedUser);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verifyPin = (pinToTest: string, user: User) => {
    if (user.pin.trim() === pinToTest.trim()) {
      StorageService.setCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    } else {
      setErrorMsg('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleQuickDemoLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.assigned_section_name && u.assigned_section_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-white border-b border-zinc-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-950 text-sm">Staff Login</h3>
              <p className="text-[11px] text-zinc-500 font-mono">Select name and enter PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {!selectedUser ? (
            // STEP 1: Staff Selection List
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search staff or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Select Your Name ({filteredUsers.length})
              </div>

              <div className="space-y-1.5">
                {filteredUsers.map((u) => {
                  const isCur = u.id === currentUser.id;
                  const isHm = u.role === 'headmaster';
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isCur
                          ? 'border-black bg-zinc-50'
                          : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 bg-zinc-100 text-zinc-900 border border-zinc-200"
                        >
                          {isHm ? 'HM' : u.assigned_section_name ? u.assigned_section_name.replace('Class ', '') : 'TR'}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 text-xs flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isCur && (
                              <span className="text-[9px] font-mono bg-zinc-900 text-white font-bold px-1 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            <span className="capitalize">{u.role}</span>
                            {u.assigned_section_name && ` • ${u.assigned_section_name}`}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-medium text-zinc-400 group-hover:text-black">
                        &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Initial Setup Info Box */}
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-700">
                <div className="font-semibold flex items-center space-x-1 text-zinc-900 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Admin Access:</span>
                </div>
                <div className="text-[11px] text-zinc-600 font-mono space-y-1">
                  <div>Default Headmaster PIN: <strong className="font-bold text-black">1234</strong></div>
                  <div className="text-zinc-500 font-sans text-[11px]">
                    To add teachers and set their PINs, log in as Headmaster and open <strong>School Admin &rarr; Staff & PINs</strong>.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // STEP 2: 4-Digit PIN Keypad
            <div className="py-2 space-y-4 text-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center space-x-1 text-xs font-medium text-zinc-500 hover:text-black mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose another teacher</span>
              </button>

              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 mx-auto flex items-center justify-center font-mono font-bold text-base">
                {selectedUser.role === 'headmaster'
                  ? 'HM'
                  : selectedUser.assigned_section_name
                  ? selectedUser.assigned_section_name.replace('Class ', '')
                  : 'TR'}
              </div>

              <div>
                <h4 className="font-bold text-zinc-950 text-sm">{selectedUser.name}</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {selectedUser.role === 'headmaster'
                    ? 'Headmaster / Admin'
                    : `Incharge for ${selectedUser.assigned_section_name || 'MDM'}`}
                </p>
              </div>

              {/* PIN Dots */}
              <div className="flex justify-center items-center space-x-2.5 my-3">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        filled
                          ? 'bg-black border-black scale-110'
                          : 'border-zinc-300 bg-zinc-100'
                      }`}
                    />
                  );
                })}
              </div>

              {errorMsg && (
                <div className="text-xs font-medium text-zinc-900 bg-zinc-100 py-1.5 px-3 rounded-lg border border-zinc-300 font-mono">
                  {errorMsg}
                </div>
              )}

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit)}
                    className="h-11 bg-white hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200 rounded-lg text-base font-mono font-bold text-zinc-900 active:scale-95 transition-all"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickDemoLogin(selectedUser)}
                  className="h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold rounded-lg border border-zinc-200 active:scale-95 flex items-center justify-center font-mono"
                  title="Quick bypass"
                >
                  Quick
                </button>
                <button
                  onClick={() => handlePinDigit('0')}
                  className="h-11 bg-white hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200 rounded-lg text-base font-mono font-bold text-zinc-900 active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  onClick={handlePinBackspace}
                  className="h-11 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg font-bold active:scale-95 flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
