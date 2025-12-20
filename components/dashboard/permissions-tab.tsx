import React, { useState } from 'react'
import { SearchBar } from '@/components/ui/search-bar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Permission = {
  id: string
  name: string
  description: string | null
  rolePermissions: { role: { id: string; name: string } }[]
}

interface PermissionsTabProps {
  permissions: Permission[]
  onCreatePermission: (name: string, description: string) => Promise<void>
  onUpdatePermission: (id: string, name: string, description: string) => Promise<void>
  onDeletePermission: (id: string) => Promise<void>
}

export function PermissionsTab({
  permissions,
  onCreatePermission,
  onUpdatePermission,
  onDeletePermission,
}: PermissionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [permissionName, setPermissionName] = useState('')
  const [permissionDesc, setPermissionDesc] = useState('')

  const filteredPermissions = permissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (perm.description && perm.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenDialog = (perm?: Permission) => {
    if (perm) {
      setEditingPermission(perm)
      setPermissionName(perm.name)
      setPermissionDesc(perm.description || '')
    } else {
      setEditingPermission(null)
      setPermissionName('')
      setPermissionDesc('')
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editingPermission) {
      await onUpdatePermission(editingPermission.id, permissionName, permissionDesc)
    } else {
      await onCreatePermission(permissionName, permissionDesc)
    }
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pl-6 pr-1 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#eceff4]">Permissions</h2>
            <p className="text-sm text-[#d8dee9]/70 mt-1">Manage system access capabilities and their definitions.</p>
          </div>
          <button 
            onClick={() => handleOpenDialog()}
            className="inline-flex items-center gap-2 bg-[rgb(236,239,244)] hover:bg-[#d8dee9] text-[#2e3440] px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            <span className="material-icons-round text-lg">add</span>
            New Permission
          </button>
        </div>
        <div className="mb-4">
          <div className="relative w-full">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#d8dee9]/50">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#4c566a] bg-[#3b4252] text-[#eceff4] outline-none transition-all shadow-sm font-medium placeholder:text-[#d8dee9]/40"
              placeholder="Search permissions by name or description..."
            />
          </div>
        </div>
      </div>

      <div className="flex-1 pl-6 pr-1 pb-6 min-h-0">
        <div className="bg-[#2e3440] border border-[#4c566a] rounded-xl shadow-sm h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#3b4252] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-2.5 text-xs font-semibold text-[#d8dee9]/70 uppercase tracking-wider border-b border-[#4c566a] w-[25%]">Name</th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-[#d8dee9]/70 uppercase tracking-wider border-b border-[#4c566a] w-[30%]">Description</th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-[#d8dee9]/70 uppercase tracking-wider border-b border-[#4c566a] w-[30%]">Used in Roles</th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-[#d8dee9]/70 uppercase tracking-wider border-b border-[#4c566a] text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4c566a]">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-[#d8dee9]/50">
                        <span className="material-icons-round text-5xl">key</span>
                        <p className="font-medium">No permissions found</p>
                        <p className="text-sm">Create your first permission or use AI Assistant</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((perm) => (
                    <tr key={perm.id} className="group hover:bg-[#3b4252] transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-[#eceff4]">{perm.name}</td>
                      <td className="px-5 py-3 text-sm text-[#d8dee9]/80">{perm.description || 'Created via AI command'}</td>
                      <td className="px-5 py-3 text-sm">
                        {perm.rolePermissions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {perm.rolePermissions.slice(0, 3).map((rp) => (
                              <span key={rp.role.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#4c566a] text-[#eceff4] border border-[#434c5e]">
                                {rp.role.name}
                              </span>
                            ))}
                            {perm.rolePermissions.length > 3 && (
                              <span className="text-xs text-[#d8dee9]/50">+{perm.rolePermissions.length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#d8dee9]/50 italic">Unused</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenDialog(perm)} className="text-[#d8dee9]/60 hover:text-primary transition-colors p-1">
                            <span className="material-icons-round text-base">edit</span>
                          </button>
                          <button onClick={() => onDeletePermission(perm.id)} className="text-[#d8dee9]/60 hover:text-red-400 transition-colors p-1">
                            <span className="material-icons-round text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? 'Edit Permission' : 'Create New Permission'}
            </DialogTitle>
            <DialogDescription>
              {editingPermission 
                ? 'Update the permission details below.' 
                : 'Add a new permission to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="perm-name">Permission Name *</Label>
              <Input
                id="perm-name"
                placeholder="e.g., can_edit_articles"
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="perm-desc">Description</Label>
              <Input
                id="perm-desc"
                placeholder="e.g., Allows editing articles"
                value={permissionDesc}
                onChange={(e) => setPermissionDesc(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#e5e9f0] hover:bg-[#3b4252] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!permissionName.trim()}
              className="px-4 py-2 text-sm font-semibold text-[#2e3440] bg-[rgb(236,239,244)] hover:bg-[#d8dee9] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPermission ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
