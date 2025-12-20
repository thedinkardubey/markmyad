import React, { useState, useEffect } from 'react'
import { ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

type Permission = {
  id: string
  name: string
  description: string | null
}

type Role = {
  id: string
  name: string
  rolePermissions: { permission: { id: string; name: string } }[]
}

interface AssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: Role[]
  permissions: Permission[]
  selectedRoleId: string | null
  onAssign: (roleId: string, permissionId: string, isAssigned: boolean) => Promise<void>
}

export function AssignmentModal({
  open,
  onOpenChange,
  roles,
  permissions,
  selectedRoleId,
  onAssign,
}: AssignmentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [roleId, setRoleId] = useState<string>(selectedRoleId || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [assignedPermissions, setAssignedPermissions] = useState<Set<string>>(new Set())
  const [originalPermissions, setOriginalPermissions] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (selectedRoleId) {
      setRoleId(selectedRoleId)
      setStep(2)
    } else {
      setStep(1)
    }
  }, [selectedRoleId])

  useEffect(() => {
    if (roleId) {
      const role = roles.find((r) => r.id === roleId)
      if (role) {
        const permIds = new Set(role.rolePermissions.map((rp) => rp.permission.id))
        setAssignedPermissions(permIds)
        setOriginalPermissions(permIds)
      }
    }
  }, [roleId, roles])

  const selectedRole = roles.find((r) => r.id === roleId)
  const filteredPermissions = permissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const togglePermission = (permId: string) => {
    setAssignedPermissions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(permId)) {
        newSet.delete(permId)
      } else {
        newSet.add(permId)
      }
      return newSet
    })
  }

  const addedPermissions = Array.from(assignedPermissions).filter(
    (id) => !originalPermissions.has(id)
  )
  const removedPermissions = Array.from(originalPermissions).filter(
    (id) => !assignedPermissions.has(id)
  )

  const handleConfirm = async () => {
    if (!roleId) return
    setProcessing(true)
    try {
      for (const permId of addedPermissions) {
        await onAssign(roleId, permId, true)
      }
      for (const permId of removedPermissions) {
        await onAssign(roleId, permId, false)
      }
      handleClose()
    } catch (error) {
      console.error('Error assigning permissions:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setRoleId('')
    setSearchTerm('')
    setAssignedPermissions(new Set())
    setOriginalPermissions(new Set())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[720px] dark:bg-[#2e3440] dark:border-[#4c566a]">
        <DialogHeader>
          <DialogTitle className="dark:text-[#eceff4]">Assign Permissions to Role</DialogTitle>
          <DialogDescription className="dark:text-[#d8dee9]/70">
            Follow the steps to assign or remove permissions from a role
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 py-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground dark:text-[#d8dee9]/50'}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-[#3b4252] text-muted-foreground dark:text-[#d8dee9]/60'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Select Role</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-[#d8dee9]/50" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground dark:text-[#d8dee9]/50'}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-[#3b4252] text-muted-foreground dark:text-[#d8dee9]/60'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Choose Permissions</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-[#d8dee9]/50" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground dark:text-[#d8dee9]/50'}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-[#3b4252] text-muted-foreground dark:text-[#d8dee9]/60'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4">
              <Label className="dark:text-[#e5e9f0]">Select a Role</Label>
              <select
                className="w-full p-2 border-0 bg-muted/50 dark:bg-[#3b4252] text-foreground dark:text-[#eceff4] rounded-md outline-none transition-colors dark:border dark:border-[#4c566a]"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">-- Choose a role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.rolePermissions.length} permissions)
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="dark:text-[#e5e9f0]">Permissions for {selectedRole?.name}</Label>
                <Badge variant="outline" className="dark:border-[#4c566a] dark:text-[#e5e9f0]">{assignedPermissions.size} selected</Badge>
              </div>
              <SearchBar
                placeholder="Search permissions..."
                onSearch={setSearchTerm}
              />
              <div className="max-h-[300px] overflow-y-auto space-y-2 border-0 rounded-md p-2 bg-muted/30 dark:bg-[#3b4252]/50">
                {filteredPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-start gap-3 p-3 border-0 rounded-md bg-card dark:bg-[#2e3440] hover:bg-muted/50 dark:hover:bg-[#3b4252] cursor-pointer transition-colors dark:border dark:border-[#4c566a]"
                    onClick={() => togglePermission(perm.id)}
                  >
                    <Checkbox
                      checked={assignedPermissions.has(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground dark:text-[#eceff4]">{perm.name}</p>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground dark:text-[#d8dee9]/70 mt-0.5">{perm.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Alert variant="info">
                Review the changes below before confirming
              </Alert>
              <div className="border-0 rounded-lg p-4 space-y-4 bg-muted/30 dark:bg-[#3b4252]/50 dark:border dark:border-[#4c566a]">
                <div>
                  <Label className="text-xs text-muted-foreground dark:text-[#d8dee9]/70">Role</Label>
                  <p className="font-semibold text-foreground dark:text-[#eceff4]">{selectedRole?.name}</p>
                </div>
                {addedPermissions.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground dark:text-[#d8dee9]/70 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Permissions Added ({addedPermissions.length})
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {addedPermissions.map((id) => {
                        const perm = permissions.find((p) => p.id === id)
                        return perm ? (
                          <Badge key={id} variant="outline" className="text-xs dark:border-[#4c566a] dark:text-[#e5e9f0]">
                            {perm.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                {removedPermissions.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground dark:text-[#d8dee9]/70 flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-destructive" />
                      Permissions Removed ({removedPermissions.length})
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {removedPermissions.map((id) => {
                        const perm = permissions.find((p) => p.id === id)
                        return perm ? (
                          <Badge key={id} variant="outline" className="text-xs dark:border-[#4c566a] dark:text-[#e5e9f0]">
                            {perm.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                {addedPermissions.length === 0 && removedPermissions.length === 0 && (
                  <p className="text-sm text-muted-foreground dark:text-[#d8dee9]/60 italic">No changes made</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
              disabled={step === 1 && !roleId}
              className="bg-[rgb(236,239,244)] hover:bg-[#d8dee9] text-[#2e3440]"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={processing || (addedPermissions.length === 0 && removedPermissions.length === 0)}
              className="bg-[rgb(236,239,244)] hover:bg-[#d8dee9] text-[#2e3440]"
            >
              {processing ? 'Applying...' : 'Confirm Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
