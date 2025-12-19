'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { LogOut, Plus, Trash2, Edit, Shield, Key, Sparkles } from 'lucide-react';

type Permission = {
  id: string;
  name: string;
  description: string | null;
  rolePermissions: { role: { id: string; name: string } }[];
};

type Role = {
  id: string;
  name: string;
  rolePermissions: { permission: { id: string; name: string } }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'assign'>('permissions');

  // Permission form state
  const [permissionName, setPermissionName] = useState('');
  const [permissionDesc, setPermissionDesc] = useState('');
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permDialogOpen, setPermDialogOpen] = useState(false);

  // Role form state
  const [roleName, setRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Assignment state
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [assignedPermissions, setAssignedPermissions] = useState<Set<string>>(new Set());

  // AI Command state
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [permsRes, rolesRes] = await Promise.all([
        fetch('/api/permissions'),
        fetch('/api/roles'),
      ]);

      if (!permsRes.ok || !rolesRes.ok) {
        router.push('/login');
        return;
      }

      const permsData = await permsRes.json();
      const rolesData = await rolesRes.json();

      setPermissions(permsData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Permission CRUD
  const handleCreatePermission = async () => {
    try {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: permissionName, description: permissionDesc }),
      });

      if (res.ok) {
        setPermissionName('');
        setPermissionDesc('');
        setPermDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission) return;

    try {
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPermission.id,
          name: permissionName,
          description: permissionDesc,
        }),
      });

      if (res.ok) {
        setEditingPermission(null);
        setPermissionName('');
        setPermissionDesc('');
        setPermDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      await fetch(`/api/permissions?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  // Role CRUD
  const handleCreateRole = async () => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roleName }),
      });

      if (res.ok) {
        setRoleName('');
        setRoleDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRole.id, name: roleName }),
      });

      if (res.ok) {
        setEditingRole(null);
        setRoleName('');
        setRoleDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await fetch(`/api/roles?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Role-Permission assignment
  useEffect(() => {
    if (selectedRole) {
      const role = roles.find((r) => r.id === selectedRole);
      if (role) {
        setAssignedPermissions(new Set(role.rolePermissions.map((rp) => rp.permission.id)));
      }
    }
  }, [selectedRole, roles]);

  const handleTogglePermission = async (permissionId: string) => {
    const isAssigned = assignedPermissions.has(permissionId);

    try {
      if (isAssigned) {
        await fetch(`/api/role-permissions?roleId=${selectedRole}&permissionId=${permissionId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/role-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId: selectedRole, permissionId }),
        });
      }
      fetchData();
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  // AI Command
  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: aiCommand }),
      });

      const data = await res.json();

      if (data.success) {
        setAiResponse(`✅ ${data.message}`);
        setAiCommand('');
        fetchData();
      } else {
        setAiResponse(`❌ ${data.error}`);
      }
    } catch (error) {
      setAiResponse('❌ An error occurred');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">RBAC Configurator</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Command Section */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Command (Bonus Feature)
            </CardTitle>
            <CardDescription>
              Use natural language to configure RBAC. Try: "Create a permission called edit_posts" or "Give the role 'Editor' the permission to 'edit_posts'"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder='e.g., "Create a new permission called publish_content"'
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiCommand()}
              />
              <Button onClick={handleAiCommand} disabled={aiLoading}>
                {aiLoading ? 'Processing...' : 'Execute'}
              </Button>
            </div>
            {aiResponse && (
              <p className="text-sm mt-2 p-2 rounded bg-white">{aiResponse}</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permissions')}
          >
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </Button>
          <Button
            variant={activeTab === 'assign' ? 'default' : 'outline'}
            onClick={() => setActiveTab('assign')}
          >
            Assign Permissions
          </Button>
        </div>

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Permissions Management</CardTitle>
                  <CardDescription>Create and manage permissions</CardDescription>
                </div>
                <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingPermission(null); setPermissionName(''); setPermissionDesc(''); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingPermission ? 'Edit Permission' : 'Create New Permission'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPermission ? 'Update the permission details' : 'Add a new permission to the system'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Permission Name</Label>
                        <Input
                          placeholder="e.g., can_edit_articles"
                          value={permissionName}
                          onChange={(e) => setPermissionName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description (Optional)</Label>
                        <Input
                          placeholder="e.g., Allows editing articles"
                          value={permissionDesc}
                          onChange={(e) => setPermissionDesc(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPermDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingPermission ? handleUpdatePermission : handleCreatePermission}>
                        {editingPermission ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Used in Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-medium">{perm.name}</TableCell>
                      <TableCell>{perm.description || '-'}</TableCell>
                      <TableCell>
                        {perm.rolePermissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {perm.rolePermissions.map((rp) => (
                              <span key={rp.role.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                {rp.role.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPermission(perm);
                            setPermissionName(perm.name);
                            setPermissionDesc(perm.description || '');
                            setPermDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePermission(perm.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {permissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No permissions yet. Create your first permission!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Roles Management</CardTitle>
                  <CardDescription>Create and manage roles</CardDescription>
                </div>
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingRole(null); setRoleName(''); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRole ? 'Update the role name' : 'Add a new role to the system'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Role Name</Label>
                        <Input
                          placeholder="e.g., Content Editor"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingRole ? handleUpdateRole : handleCreateRole}>
                        {editingRole ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        {role.rolePermissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.rolePermissions.map((rp) => (
                              <span key={rp.permission.id} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                                {rp.permission.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No permissions</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRole(role);
                            setRoleName(role.name);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {roles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No roles yet. Create your first role!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Assign Permissions Tab */}
        {activeTab === 'assign' && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Permissions to Roles</CardTitle>
              <CardDescription>
                Select a role and check/uncheck permissions to assign or remove them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Select Role</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">-- Select a role --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div>
                  <Label className="mb-4 block">Permissions</Label>
                  <div className="space-y-3">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                          id={perm.id}
                          checked={assignedPermissions.has(perm.id)}
                          onCheckedChange={() => handleTogglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={perm.id} className="text-sm font-medium cursor-pointer">
                            {perm.name}
                          </label>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {permissions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No permissions available. Create permissions first!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
