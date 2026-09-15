import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TaskModal } from './components/TaskModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { AuthGateModal } from './components/AuthGateModal';
import { exportTasksToCSV } from './lib/csvHelper';
import { sendDiscordWebhookNotification } from './lib/discordWebhook';
import { fetchDiscordGuildRole } from './lib/discordRoles';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  addBugToTask, 
  toggleBugStatus, 
  subscribeToTasks,
  supabase,
  recordDiscordLogin,
  hasTrialOrAboveRole
} from './lib/supabase';

export function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_beta_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [viewMode, setViewMode] = useState('board');
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);

  const handleAuthenticate = (userData) => {
    setUser(userData);
    localStorage.setItem('ff_beta_user', JSON.stringify(userData));
  };

  const handleDisconnectUser = async () => {
    setUser(null);
    localStorage.removeItem('ff_beta_user');
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handleToggleOfficerRole = () => {
    if (!user) return;
    const newRole = user.role === 'Officer' ? 'Trial' : 'Officer';
    const updatedUser = {
      ...user,
      role: newRole,
      isOfficer: newRole === 'Officer'
    };
    handleAuthenticate(updatedUser);
  };

  const activeCharacter = user ? (user.displayName || user.username) : 'Tester';

  // Listen for Supabase OAuth callback and fetch real Discord User ID
  useEffect(() => {
    if (!supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        
        const displayName = meta.custom_claims?.global_name || meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Discord Tester';
        const accountHandle = meta.name || meta.user_name || session.user.email?.split('@')[0] || displayName;
        
        // Extract real numeric Discord User ID from provider_id, identities, or sub
        const realDiscordId = session.user.user_metadata?.provider_id || session.user.identities?.[0]?.id || session.user.user_metadata?.sub || '';

        const detectedRole = await fetchDiscordGuildRole(session.provider_token, session.user);

        const authUser = {
          displayName,
          username: accountHandle.startsWith('@') ? accountHandle : `@${accountHandle}`,
          discordId: realDiscordId,
          avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(displayName)}`,
          email: session.user.email || '',
          role: detectedRole,
          isOfficer: detectedRole === 'Officer',
          verifiedAt: new Date().toISOString()
        };

        if (hasTrialOrAboveRole(authUser)) {
          handleAuthenticate(authUser);
          await recordDiscordLogin(authUser);
        } else {
          alert('Access Restricted: You must hold the Trial role or above in our Discord server to access beta testing.');
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch tasks and subscribe to real-time changes
  useEffect(() => {
    let unsubscribe = () => {};

    async function init() {
      const initialTasks = await fetchTasks();
      setTasks(initialTasks);

      unsubscribe = subscribeToTasks((updatedTasks) => {
        setTasks(updatedTasks);
        setSelectedTask((prev) => {
          if (!prev) return null;
          return updatedTasks.find((t) => t.id === prev.id) || prev;
        });
      });
    }

    init();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const freshTasks = await fetchTasks();
      setTasks(freshTasks);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCreateTask = async (newTaskData) => {
    const created = await createTask({
      ...newTaskData,
      assigned_discord_id: newTaskData.assigned_to ? (user?.discordId || '') : '',
      created_by: activeCharacter
    });
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);

    if (created.assigned_to) {
      sendDiscordWebhookNotification({ eventType: 'TASK_CREATED', task: created, user: activeCharacter });
    }

    return created;
  };

  const handleMassImportTasks = async (newTasksArray) => {
    for (const t of newTasksArray) {
      const created = await createTask({
        ...t,
        created_by: activeCharacter
      });
      if (created.assigned_to) {
        sendDiscordWebhookNotification({ eventType: 'TASK_CREATED', task: created, user: activeCharacter });
      }
    }
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);
  };

  const handleUpdateTask = async (taskId, updates) => {
    const updated = await updateTask(taskId, updates);
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    if (updates.status === 'Failed') {
      sendDiscordWebhookNotification({ eventType: 'TASK_FAILED', task: updated, user: activeCharacter });
    } else if (updates.status === 'Result') {
      sendDiscordWebhookNotification({ eventType: 'TASK_RESULT', task: updated, user: activeCharacter });
    }

    return updated;
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleClaimTask = async (taskId, characterName) => {
    await handleUpdateTask(taskId, {
      assigned_to: characterName,
      assigned_discord_id: user?.discordId || '',
      status: 'In Progress'
    });
  };

  const handleAddBug = async (taskId, bugData) => {
    await addBugToTask(taskId, {
      ...bugData,
      reported_by: activeCharacter
    });
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);

    const target = freshTasks.find(t => t.id === taskId);
    if (target) {
      sendDiscordWebhookNotification({ eventType: 'BUG_REPORTED', task: target, bug: bugData, user: activeCharacter });
    }
  };

  const handleToggleBugStatus = async (taskId, bugId) => {
    await toggleBugStatus(taskId, bugId);
    const freshTasks = await fetchTasks();
    setTasks(freshTasks);
  };

  const displayedTasks = showOnlyMyTasks && user
    ? tasks.filter(t => (t.assigned_to || '').toLowerCase() === activeCharacter.toLowerCase())
    : tasks;

  const tasksOpen = tasks.filter((t) => t.status === 'To Test').length;
  const tasksInProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const tasksFailed = tasks.filter((t) => t.status === 'Failed').length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0d1117] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Password & Discord Gate Modal */}
      {!user && (
        <AuthGateModal onAuthenticate={handleAuthenticate} />
      )}

      {/* Connection Notice */}
      <SupabaseSetupNotice />

      {/* Main Navbar Header */}
      <Navbar
        user={user}
        onDisconnectUser={handleDisconnectUser}
        onToggleOfficerRole={handleToggleOfficerRole}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportCsv={() => exportTasksToCSV(tasks)}
        tasksOpen={tasksOpen}
        tasksInProgress={tasksInProgress}
        tasksFailed={tasksFailed}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showOnlyMyTasks={showOnlyMyTasks}
        setShowOnlyMyTasks={setShowOnlyMyTasks}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {viewMode === 'board' ? (
          <KanbanBoard
            tasks={displayedTasks}
            activeCharacter={activeCharacter}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectTask={(task) => setSelectedTask(task)}
            onClaimTask={handleClaimTask}
            onMoveTask={handleUpdateTask}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <ListView
            tasks={displayedTasks}
            activeCharacter={activeCharacter}
            onSelectTask={(task) => setSelectedTask(task)}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          activeCharacter={activeCharacter}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddBug={handleAddBug}
          onToggleBugStatus={handleToggleBugStatus}
        />
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          activeCharacter={activeCharacter}
          user={user}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Import CSV Modal (Officer Only) */}
      {isImportModalOpen && (
        <ImportCsvModal
          onClose={() => setIsImportModalOpen(false)}
          onMassImportTasks={handleMassImportTasks}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#21262d] bg-[#090c10] py-4 px-6 text-center text-xs text-slate-500 font-sans">
        <p>FF - Beta Testing &bull; Discord Real Numeric ID Pings & Allowed Mentions Active</p>
      </footer>
    </div>
  );
}

export default App;
