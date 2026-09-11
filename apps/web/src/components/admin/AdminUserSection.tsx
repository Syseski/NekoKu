import React, { useState } from 'react';
import { User, CatProfile } from '../../types';
import { Users, Search, Heart, Shield, Sparkles, X, Phone, Mail, Calendar } from 'lucide-react';

interface ExtendedUser extends User {
  phoneNumber?: string;
  createdAt: string;
  _count?: { orders: number };
  catProfiles?: CatProfile[];
}

interface AdminUserSectionProps {
  users: ExtendedUser[];
}

export const AdminUserSection: React.FC<AdminUserSectionProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForCats, setSelectedUserForCats] = useState<ExtendedUser | null>(null);

  const filteredUsers = users.filter((u) => {
    return (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Users & Cat Profiles Management</h3>
          <p className="text-xs text-slate-400">Analyze cat owner demographics, registered cat ages & customer dietary requirements</p>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email & Phone</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Registered Cats</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const catCount = u.catProfiles?.length || 0;
                const isAdmin = u.role === 'ADMIN';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                          isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-brand-700'
                        }`}>
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-700 font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </p>
                        {u.phoneNumber && (
                          <p className="text-slate-400 text-[10px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {u.phoneNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-sans">
                      {u._count?.orders || 0} orders
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                        <span className="font-bold text-slate-900">{catCount} cats</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserForCats(u)}
                        disabled={catCount === 0}
                        className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-700 font-bold text-[11px] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        View Cats 🐾
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cat Profile Review Modal */}
      {selectedUserForCats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-orange-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Cat Profiles Review
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cats owned by {selectedUserForCats.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForCats(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {selectedUserForCats.catProfiles && selectedUserForCats.catProfiles.length > 0 ? (
                selectedUserForCats.catProfiles.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl border border-orange-100 bg-orange-50/30 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      {cat.avatarUrl ? (
                        <img src={cat.avatarUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🐱</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-brand-900 text-[10px] font-bold capitalize">
                          {cat.lifeStage.toLowerCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Breed: <strong className="text-slate-700">{cat.breed || 'Domestic Breed'}</strong> • Weight: <strong className="text-slate-700">{cat.weightKg ? `${cat.weightKg} kg` : 'Not specified'}</strong>
                      </p>

                      {/* Health Focuses */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Health Focus & Diet:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.healthConcerns && cat.healthConcerns.length > 0 ? (
                            cat.healthConcerns.map((hc) => (
                              <span
                                key={hc.id || hc.condition}
                                className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold"
                              >
                                {hc.condition.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No health issues registered</span>
                          )}
                        </div>
                      </div>

                      {cat.allergies && (
                        <p className="text-xs text-slate-500 pt-1">
                          <strong className="text-slate-700">Food allergies:</strong> {cat.allergies}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  This user has not registered any cat profiles yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedUserForCats(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
