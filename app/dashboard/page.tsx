'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AIAssistantPanel } from '@/components/dashboard/ai-assistant-panel';
import { PermissionsTab } from '@/components/dashboard/permissions-tab';
import { RolesTab } from '@/components/dashboard/roles-tab';
import { AssignmentModal } from '@/components/dashboard/assignment-modal';
import { Toast } from '@/components/ui/toast';

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
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'assignments'>('permissions');
  
  // AI Assistant state
  const [aiResponse, setAiResponse] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  const handleCreatePermission = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        await fetchData();
        showToast('Permission created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      showToast('Failed to create permission', 'error');
    }
  };

  const handleUpdatePermission = async (id: string, name: string, description: string) => {
    try {
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description }),
      });
      if (res.ok) {
        await fetchData();
        showToast('Permission updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      showToast('Failed to update permission', 'error');
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    try {
      await fetch(`/api/permissions?id=${id}`, { method: 'DELETE' });
      await fetchData();
      showToast('Permission deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting permission:', error);
      showToast('Failed to delete permission', 'error');
    }
  };

  const handleCreateRole = async (name: string) => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchData();
        showToast('Role created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showToast('Failed to create role', 'error');
    }
  };

  const handleUpdateRole = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });
      if (res.ok) {
        await fetchData();
        showToast('Role updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Failed to update role', 'error');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await fetch(`/api/roles?id=${id}`, { method: 'DELETE' });
      await fetchData();
      showToast('Role deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast('Failed to delete role', 'error');
    }
  };

  const handleOpenAssignment = (roleId?: string) => {
    setSelectedRoleId(roleId || null);
    setAssignmentModalOpen(true);
  };

  const handleAssignPermission = async (roleId: string, permissionId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await fetch('/api/role-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId, permissionId }),
        });
      } else {
        await fetch(`/api/role-permissions?roleId=${roleId}&permissionId=${permissionId}`, {
          method: 'DELETE',
        });
      }
      await fetchData();
    } catch (error) {
      console.error('Error toggling permission:', error);
      throw error;
    }
  };

  const handleAiCommand = async (command: string) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse({ message: data.message, type: 'success' });
        await fetchData();
      } else {
        setAiResponse({ message: data.error, type: 'error' });
      }
    } catch (error) {
      setAiResponse({ message: 'An error occurred', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-[#2e3440]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-[#d8dee9]/70 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#2e3440] transition-colors duration-200">
      {/* Header */}
      <header className="h-16 bg-[#3b4252] border-b border-[#4c566a] flex items-center justify-between px-6 shrink-0 z-20 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <span className="material-icons-round text-xl">security</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#eceff4]">RBAC Configurator</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-[#e5e9f0] hover:text-[#eceff4] transition-colors font-semibold"
          >
            <span className="material-icons-round text-lg">logout</span>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className="w-16 bg-[#3b4252] border-r border-[#4c566a] flex flex-col items-center py-4 shrink-0 mt-16">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all ${
            activeTab === 'permissions'
              ? 'bg-[#eceff4] text-[#2e3440] shadow-sm active'
              : 'text-[#d8dee9] hover:text-[#eceff4] hover:bg-[#434c5e]'
          }`}
          title="Permissions"
        >
          <span className="material-icons-round text-lg">key</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all ${
            activeTab === 'roles'
              ? 'bg-[#eceff4] text-[#2e3440] shadow-sm active'
              : 'text-[#d8dee9] hover:text-[#eceff4] hover:bg-[#434c5e]'
          }`}
          title="Roles"
        >
          <span className="material-icons-round text-lg">admin_panel_settings</span>
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center justify-center w-10 h-10 mb-2 rounded-lg transition-all ${
            activeTab === 'assignments'
              ? 'bg-[#eceff4] text-[#2e3440] shadow-sm active'
              : 'text-[#d8dee9] hover:text-[#eceff4] hover:bg-[#434c5e]'
          }`}
          title="Assign"
        >
          <span className="material-icons-round text-lg">manage_accounts</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#2e3440] mt-16">
        {activeTab === 'permissions' && (
          <PermissionsTab
            permissions={permissions}
            onCreatePermission={handleCreatePermission}
            onUpdatePermission={handleUpdatePermission}
            onDeletePermission={handleDeletePermission}
          />
        )}
        {activeTab === 'roles' && (
          <RolesTab
            roles={roles}
            onCreateRole={handleCreateRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
            onEditPermissions={handleOpenAssignment}
          />
        )}
        {activeTab === 'assignments' && (
          <div className="pl-6 pr-1 pt-6 pb-6 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#eceff4]">Permission Assignments</h2>
                <p className="text-sm text-[#d8dee9]/70 mt-1">Assign permissions to roles in bulk</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#3b4252] to-[#2e3440] rounded-2xl p-16 text-center border border-[#4c566a]">
              <div className="w-20 h-20 rounded-2xl bg-[rgb(236,239,244)]/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-icons-round text-[rgb(236,239,244)] text-5xl">manage_accounts</span>
              </div>
              <h3 className="text-xl font-semibold text-[#eceff4] mb-2">Ready to Assign Permissions?</h3>
              <p className="text-[#d8dee9]/80 mb-6 max-w-md mx-auto">
                Use the wizard to assign or remove permissions from roles with an intuitive step-by-step process
              </p>
              <button
                onClick={() => handleOpenAssignment()}
                className="inline-flex items-center gap-2 bg-[rgb(236,239,244)] hover:bg-[#d8dee9] text-[#2e3440] px-6 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-[rgb(236,239,244)]/30 transition-all active:scale-95"
              >
                <span className="material-icons-round text-lg">add</span>
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>

      {/* AI Assistant Sidebar */}
      <AIAssistantPanel
        onExecute={handleAiCommand}
        response={aiResponse}
        loading={aiLoading}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        roles={roles}
        permissions={permissions}
        selectedRoleId={selectedRoleId}
        onAssign={handleAssignPermission}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
