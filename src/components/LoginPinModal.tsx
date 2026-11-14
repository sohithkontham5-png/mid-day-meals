import React, { useState } from 'react';
import { User, SectionItem } from '../types';
import { StorageService } from '../lib/storage';
import { X, KeyRound, UserCheck, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Search } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/80 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Staff Login & Switcher</h3>
              <p className="text-xs text-emerald-200">Select your name and enter 4-digit PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-600/50 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {!selectedUser ? (
            // STEP 1: Staff Selection List
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff or class (e.g. 6A, Lakshmi, HM)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Select Your Name ({filteredUsers.length})
              </div>

              <div className="space-y-2">
                {filteredUsers.map((u) => {
                  const isCur = u.id === currentUser.id;
                  const isHm = u.role === 'headmaster';
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                        isCur
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isHm
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isHm ? 'HM' : u.assigned_section_name ? u.assigned_section_name.replace('Class ', '') : 'TR'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isCur && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                            <span className="capitalize">{u.role}</span>
                            {u.assigned_section_name && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-emerald-700">{u.assigned_section_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/70 px-2 py-1 rounded-lg">
                          PIN Login &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Demo Helper Box */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center space-x-1 text-amber-950 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo PINs Reference:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-amber-800">
                  <div>• Headmaster: <strong className="font-mono">1234</strong></div>
                  <div>• Class 6A: <strong className="font-mono">1111</strong></div>
                  <div>• Class 6B: <strong className="font-mono">2222</strong></div>
                  <div>• Class 7A: <strong className="font-mono">3333</strong></div>
                </div>
              </div>
            </div>
          ) : (
            // STEP 2: 4-Digit PIN Keypad
            <div className="py-2 space-y-4 text-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose another teacher</span>
              </button>

              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 mx-auto flex items-center justify-center font-bold text-lg">
                {selectedUser.role === 'headmaster'
                  ? 'HM'
                  : selectedUser.assigned_section_name
                  ? selectedUser.assigned_section_name.replace('Class ', '')
                  : 'TR'}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-base">{selectedUser.name}</h4>
                <p className="text-xs text-slate-500">
                  {selectedUser.role === 'headmaster'
                    ? 'Headmaster / Admin'
                    : `Incharge for ${selectedUser.assigned_section_name || 'MDM'}`}
                </p>
              </div>

              {/* PIN Dots Display */}
              <div className="flex justify-center items-center space-x-3 my-4">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        filled
                          ? 'bg-emerald-600 border-emerald-600 scale-110'
                          : 'border-slate-300 bg-slate-100'
                      }`}
                    />
                  );
                })}
              </div>

              {errorMsg && (
                <div className="text-xs font-medium text-rose-600 bg-rose-50 py-1.5 px-3 rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Numeric Keypad for Mobile/Touch */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit)}
                    className="h-12 bg-slate-100 hover:bg-emerald-50 active:bg-emerald-200 border border-slate-200 hover:border-emerald-300 rounded-xl text-lg font-bold text-slate-800 active:scale-95 transition-all"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickDemoLogin(selectedUser)}
                  className="h-12 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 active:scale-95 flex items-center justify-center"
                  title="One-click demo bypass"
                >
                  Quick In
                </button>
                <button
                  onClick={() => handlePinDigit('0')}
                  className="h-12 bg-slate-100 hover:bg-emerald-50 active:bg-emerald-200 border border-slate-200 hover:border-emerald-300 rounded-xl text-lg font-bold text-slate-800 active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  onClick={handlePinBackspace}
                  className="h-12 bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl font-bold active:scale-95 flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              <div className="text-[11px] text-slate-400 pt-2">
                Default PIN is <strong className="font-mono text-slate-600">{selectedUser.pin}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
