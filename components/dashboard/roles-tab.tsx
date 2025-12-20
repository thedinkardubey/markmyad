import React, { useState } from 'react'
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Role = {
  id: string
  name: string
  rolePermissions: { permission: { id: string; name: string } }[]
}

interface RolesTabProps {
  roles: Role[]
  onCreateRole: (name: string) => Promise<void>
  onUpdateRole: (id: string, name: string) => Promise<void>
  onDeleteRole: (id: string) => Promise<void>
  onEditPermissions: (roleId: string) => void
}

export function RolesTab({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onEditPermissions,
}: RolesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleName(role.name)
    } else {
      setEditingRole(null)
      setRoleName('')
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editingRole) {
      await onUpdateRole(editingRole.id, roleName)
    } else {
      await onCreateRole(roleName)
    }
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="pl-6 pr-1 pt-6 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#eceff4]">Roles</h2>
            <p className="text-sm text-[#d8dee9]/70 mt-1">Manage user roles and their permission sets</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
        </div>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search roles..."
          onSearch={setSearchTerm}
          className="max-w-full"
        />

        {/* Card Grid */}
        {filteredRoles.length === 0 ? (
          <div className="bg-[#2e3440] rounded-lg py-16 border border-[#4c566a]">
            <div className="flex flex-col items-center gap-2 text-[#d8dee9]/60">
              <Shield className="h-12 w-12 text-[#d8dee9]/50" />
              <p className="font-medium">No roles found</p>
              <p className="text-sm">Create your first role or use AI Assistant</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-all bg-[#3c4251] border-[#4c566a]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base text-[#eceff4]">{role.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs border-[#4c566a] text-[#e5e9f0]">
                      <Users className="h-3 w-3 mr-1" />
                      {role.rolePermissions.length}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-2 text-[#d8dee9]/70">
                    {role.rolePermissions.length} permission{role.rolePermissions.length !== 1 ? 's' : ''} assigned
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  {role.rolePermissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {role.rolePermissions.slice(0, 4).map((rp) => (
                        <Badge key={rp.permission.id} variant="secondary" className="text-xs bg-[#3b4252] text-[#e5e9f0] border-[#4c566a]">
                          {rp.permission.name}
                        </Badge>
                      ))}
                      {role.rolePermissions.length > 4 && (
                        <Badge variant="outline" className="text-xs border-[#4c566a] text-[#d8dee9]/70">
                          +{role.rolePermissions.length - 4} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#d8dee9]/50 italic">No permissions assigned</p>
                  )}
                </CardContent>
                <CardFooter className="pt-3  flex gap-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-none bg-[#4c566a] text-[#eceff4] hover:bg-[rgb(75,82,102)] rounded-full"
                    onClick={() => onEditPermissions(role.id)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-none bg-[#4c566a] text-[#eceff4] hover:bg-[rgb(75,82,102)] rounded-full"
                    onClick={() => handleOpenDialog(role)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-none bg-[#4c566a] text-[#eceff4] hover:bg-[rgb(75,82,102)] rounded-full"
                    onClick={() => onDeleteRole(role.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? 'Update the role name below.' 
                : 'Add a new role to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g., Content Editor"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!roleName.trim()}
            >
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
