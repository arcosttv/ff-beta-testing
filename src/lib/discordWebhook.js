// Discord Webhook Notification Helper

const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL || '';

export async function sendDiscordWebhookNotification({ eventType, task, bug, user }) {
  const targetUrl = webhookUrl || localStorage.getItem('ff_discord_webhook_url') || '';
  if (!targetUrl) return;

  let color = 0x5865f2; // Discord Blue
  let title = 'FF - Beta Task Update';
  let description = '';
  let content = '';

  const assignedUser = task?.assigned_to || user || '';
  const assignedPing = task?.assigned_discord_id 
    ? `<@${task.assigned_discord_id}>`
    : assignedUser ? (assignedUser.startsWith('@') ? assignedUser : `@${assignedUser}`) : '';

  // 1. NEW TASK CREATED (Ping assigned user if assigned)
  if (eventType === 'TASK_CREATED') {
    // Only notify/ping if a user is assigned to the new task
    if (!assignedUser) return;

    color = 0x06b6d4; // Cyan
    title = `📋 New Test Task Assigned: ${task.title}`;
    content = `🔔 Alert for ${assignedPing} — You have been assigned a new beta test task: **${task.title}**`;
    description = `**Category:** ${task.category}\n**Priority:** ${task.priority}\n**Assigned To:** ${assignedUser}\n**Objectives:** ${task.description || 'No description provided'}`;

  // 2. TASK FAILED (Clean post WITHOUT ANY PINGS)
  } else if (eventType === 'TASK_FAILED' || task?.status === 'Failed') {
    color = 0xf43f5e; // Rose Red
    title = `🚨 Test Task Failed: ${task.title}`;
    content = `🚨 **Task Failed**: ${task.title}`; // NO @ PING
    description = `**Category:** ${task.category}\n**Tested By:** ${assignedUser || 'Unassigned'}\n**Notes / Reason:** ${task.feedback_notes || 'No failure notes provided'}`;

  // 3. BUG REPORTED (Clean post without pings)
  } else if (eventType === 'BUG_REPORTED') {
    color = 0xeab308; // Yellow
    title = `🐛 Bug Reported on ${task.title}`;
    content = `🐛 **Bug Logged**: ${bug.title}`; // NO @ PING
    description = `**Task:** ${task.title}\n**Severity:** ${bug.severity}\n**Reported By:** ${bug.reported_by || user}`;

  // 4. TASK RESULT (Clean post without pings)
  } else if (eventType === 'TASK_RESULT' || task?.status === 'Result') {
    color = 0x10b981; // Green
    title = `✅ Test Completed (Result): ${task.title}`;
    content = `✅ **Test Passed**: ${task.title}`; // NO @ PING
    description = `**Category:** ${task.category}\n**Tested By:** ${assignedUser || 'Unassigned'}\n**Feedback:** ${task.feedback_notes || 'Passed successfully'}`;
  }

  const embedPayload = {
    username: 'FF Beta Bot',
    avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=FFBetaBot',
    content,
    embeds: [
      {
        title,
        description,
        color,
        fields: [
          { name: 'Priority', value: task?.priority || 'Normal', inline: true },
          { name: 'Category', value: task?.category || 'General', inline: true }
        ],
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embedPayload)
    });
  } catch (err) {
    console.error('Discord Webhook notification failed:', err);
  }
}
