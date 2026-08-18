import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Loader2, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { permissionService, Permission, LmsRole } from '@/services/admin/permissionService';

interface PermissionEditorProps {
  lmsRole: LmsRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionEditor({ lmsRole, isOpen, onClose }: PermissionEditorProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen, lmsRole.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allPerms, rolePerms] = await Promise.all([
        permissionService.getAllPermissions(),
        permissionService.getRolePermissions(lmsRole.id)
      ]);
      
      setAllPermissions(allPerms);
      setSelectedIds(new Set(rolePerms.permissions.map(p => p.id)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load permissions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permId: number) => {
    if (lmsRole.name === 'ADMIN') return;
    
    const newSet = new Set(selectedIds);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    setSelectedIds(newSet);
  };

  const handleToggleModule = (moduleName: string, modulePerms: Permission[]) => {
    if (lmsRole.name === 'ADMIN') return;
    
    const newSet = new Set(selectedIds);
    const allSelected = modulePerms.every(p => newSet.has(p.id));
    
    if (allSelected) {
      modulePerms.forEach(p => newSet.delete(p.id));
    } else {
      modulePerms.forEach(p => newSet.add(p.id));
    }
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    if (lmsRole.name === 'ADMIN') return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      await permissionService.assignPermissions(lmsRole.id, Array.from(selectedIds));
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save permissions';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!isOpen) return null;

  const isAdmin = lmsRole.name === 'ADMIN';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  LMS Permissions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  Configuring access for LMS role: 
                  <span className="font-mono font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                    {lmsRole.name}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Loading permissions matrix...</p>
              </div>
            ) : (
              <>
                {isAdmin && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex gap-4 text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">Super Admin Role</h4>
                      <p className="text-sm mt-1 opacity-90">
                        The ADMIN role automatically bypasses all permission checks at the middleware level. 
                        Modifying permissions for this role is disabled to prevent accidental lockouts.
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(permissionsByModule).map(([module, perms]) => {
                    const allSelected = perms.every(p => selectedIds.has(p.id));
                    const someSelected = perms.some(p => selectedIds.has(p.id)) && !allSelected;

                    return (
                      <div key={module} className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Module Header */}
                        <div 
                          className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => handleToggleModule(module, perms)}
                        >
                          <h3 className="font-bold text-slate-900 dark:text-slate-50 capitalize">
                            {module.toLowerCase()} Controls
                          </h3>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            allSelected 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : someSelected
                                ? 'bg-indigo-600/20 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                          }`}>
                            {allSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            {someSelected && <div className="w-2.5 h-0.5 bg-indigo-600 rounded-full" />}
                          </div>
                        </div>

                        {/* Permissions List */}
                        <div className="p-2 space-y-1">
                          {perms.map(perm => (
                            <label 
                              key={perm.id}
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                selectedIds.has(perm.id)
                                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                              } ${isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <div className="pt-0.5">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  selectedIds.has(perm.id)
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                }`}>
                                  {selectedIds.has(perm.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={selectedIds.has(perm.id)}
                                  onChange={() => handleToggle(perm.id)}
                                  disabled={isAdmin}
                                />
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${
                                  selectedIds.has(perm.id) 
                                    ? 'text-indigo-900 dark:text-indigo-100' 
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  {perm.code}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                  {perm.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {!loading && !isAdmin && (
                <>Selected <strong>{selectedIds.size}</strong> of {allPermissions.length} permissions</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || saving || isAdmin}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {success ? 'Saved!' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
