import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'guild_kanban_beta_tasks_v1';
const LOCAL_DISCORD_LOGINS_KEY = 'guild_kanban_discord_logins_v1';

export function isOfficer(user) {
  if (!user) return false;
  return user.role === 'Officer' || user.role === 'Officer/Admin' || user.isOfficer === true;
}

export function hasTrialOrAboveRole(user) {
  if (!user) return false;
  const role = (user.role || 'Trial').toLowerCase();
  return ['trial', 'raider', 'officer', 'admin', 'officer/admin', 'guild master'].includes(role);
}

// Initial Demo Tasks
const INITIAL_DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Elwynn Forest & Westfall Lvl 1-15 Optimized Quest Route',
    description: 'Test optimized questing route for Alliance characters from Northshire Valley to Sentinel Hill. Record total time spent and XP per hour.',
    category: 'Quest Route',
    status: 'To Test',
    priority: 'High',
    assigned_to: '',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    created_by: 'GuildMaster',
    feedback_notes: '',
    media_url: '',
    bugs: []
  },
  {
    id: 'demo-2',
    title: 'Leveling Speed Benchmark: Human Paladin Level 10 to 20',
    description: 'Log time spent grinding & questing between levels 10 and 20 using Judgement of Light vs Judgement of Wisdom.',
    category: 'Leveling Speed',
    status: 'In Progress',
    priority: 'Urgent',
    assigned_to: 'Valkyrie',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    created_by: 'RaidLead',
    feedback_notes: 'Lvl 10-15 took 2h 15m. Need more weapon upgrade availability in Redridge.',
    media_url: '',
    bugs: []
  },
  {
    id: 'demo-3',
    title: 'Racials: Dwarf Priest Stoneform & Fear Ward Test',
    description: 'Test Dwarf Priest Stoneform poison dispel and Fear Ward cooldown accuracy during boss encounter pulls.',
    category: 'Racials',
    status: 'Result',
    priority: 'Medium',
    assigned_to: 'ShadowPriest',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    created_by: 'Officer',
    feedback_notes: 'Fear Ward dispels fear cast as expected. 30s cooldown verified.',
    media_url: '',
    bugs: []
  },
  {
    id: 'demo-4',
    title: 'Deadmines Quest Cluster & Boss Loot Table Check',
    description: 'Verify all quest rewards in Westfall for Deadmines chain grant correct XP upon completion.',
    category: 'Dungeon',
    status: 'Failed',
    priority: 'High',
    assigned_to: 'CodeMage',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_by: 'CodeMage',
    feedback_notes: 'Quest "The Defias Brotherhood" part 6 does not grant XP on turn in.',
    media_url: '',
    bugs: [
      {
        id: 'bug-103',
        title: 'Defias Questpart 6 grants 0 XP on turn in',
        severity: 'Critical',
        status: 'open',
        reported_by: 'CodeMage',
        created_at: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  }
];

function getLocalTasks() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_TASKS;
  }
}

function saveLocalTasks(tasks) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new CustomEvent('local-tasks-changed', { detail: tasks }));
}

export async function signInWithDiscord() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
        scopes: 'identify email guilds'
      }
    });
    if (error) throw error;
    return data;
  }
  return null;
}

export async function recordDiscordLogin(userProfile) {
  if (!userProfile) return;

  const record = {
    discord_username: userProfile.displayName || userProfile.username,
    discord_handle: userProfile.username || '',
    discord_id: userProfile.discordId || '',
    avatar_url: userProfile.avatarUrl || '',
    role: userProfile.role || 'Trial',
    logged_in_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('discord_logins').insert([record]);
    } catch (err) {
      console.error('Failed to log Discord login to Supabase:', err);
    }
  } else {
    try {
      const logs = JSON.parse(localStorage.getItem(LOCAL_DISCORD_LOGINS_KEY) || '[]');
      localStorage.setItem(LOCAL_DISCORD_LOGINS_KEY, JSON.stringify([record, ...logs]));
    } catch (e) {}
  }
}

export async function fetchGuildTesters() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('discord_logins')
        .select('discord_username, discord_id')
        .not('discord_id', 'eq', '')
        .order('logged_in_at', { ascending: false });

      if (data && data.length > 0) {
        const unique = [];
        const seen = new Set();
        for (const item of data) {
          const name = item.discord_username;
          if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            unique.push({ displayName: name, discordId: item.discord_id });
          }
        }
        return unique;
      }
    } catch (err) {}
  }
  
  try {
    const logs = JSON.parse(localStorage.getItem(LOCAL_DISCORD_LOGINS_KEY) || '[]');
    const unique = [];
    const seen = new Set();
    for (const item of logs) {
      const name = item.discord_username;
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        unique.push({ displayName: name, discordId: item.discord_id });
      }
    }
    return unique;
  } catch (e) {
    return [];
  }
}

export async function fetchTasks() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return getLocalTasks();
      }
      return data || [];
    } catch (err) {
      return getLocalTasks();
    }
  }
  return getLocalTasks();
}

export async function createTask(newTaskData) {
  const newTask = {
    title: newTaskData.title,
    description: newTaskData.description || '',
    category: newTaskData.category || 'General',
    status: newTaskData.status || 'To Test',
    priority: newTaskData.priority || 'Normal',
    assigned_to: newTaskData.assigned_to || '',
    created_by: newTaskData.created_by || 'Guild Member',
    feedback_notes: '',
    media_url: '',
    bugs: []
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const localNewTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const tasks = getLocalTasks();
    const updated = [localNewTask, ...tasks];
    saveLocalTasks(updated);
    return localNewTask;
  }
}

export async function updateTask(taskId, updates) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const tasks = getLocalTasks();
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    saveLocalTasks(updated);
    return updated.find(t => t.id === taskId);
  }
}

export async function deleteTask(taskId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } else {
    const tasks = getLocalTasks();
    const updated = tasks.filter(t => t.id !== taskId);
    saveLocalTasks(updated);
  }
}

export async function addBugToTask(taskId, bug) {
  const tasks = await fetchTasks();
  const targetTask = tasks.find(t => t.id === taskId);
  if (!targetTask) return;

  const newBug = {
    id: `bug-${Date.now()}`,
    title: bug.title,
    severity: bug.severity || 'Major',
    status: 'open',
    reported_by: bug.reported_by || 'Tester',
    created_at: new Date().toISOString()
  };

  const updatedBugs = [...(targetTask.bugs || []), newBug];
  return await updateTask(taskId, { bugs: updatedBugs });
}

export function toggleBugStatus(taskId, bugId) {
  return fetchTasks().then(tasks => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedBugs = (targetTask.bugs || []).map(b => {
      if (b.id === bugId) {
        return { ...b, status: b.status === 'open' ? 'fixed' : 'open' };
      }
      return b;
    });

    return updateTask(taskId, { bugs: updatedBugs });
  });
}

export function subscribeToTasks(onTasksUpdated) {
  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        async () => {
          const freshTasks = await fetchTasks();
          onTasksUpdated(freshTasks);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        onTasksUpdated(getLocalTasks());
      }
    };
    const handleCustomChange = (e) => {
      onTasksUpdated(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-tasks-changed', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-tasks-changed', handleCustomChange);
    };
  }
}
