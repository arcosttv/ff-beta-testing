// CSV Export & Mass Import Helper

export function exportTasksToCSV(tasks) {
  if (!tasks || tasks.length === 0) return;

  const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Description', 'Feedback Notes', 'Media Link', 'Bugs Count', 'Created At'];
  
  const rows = tasks.map(t => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.priority || 'Normal',
    t.status || 'To Test',
    `"${(t.assigned_to || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.feedback_notes || '').replace(/"/g, '""')}"`,
    `"${(t.media_url || '').replace(/"/g, '""')}"`,
    (t.bugs || []).length,
    t.created_at || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ff_beta_tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToTasks(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length <= 1) return [];

  const newTasks = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Basic CSV splitting handling quotes
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
    const matches = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      matches.push(val ? val.trim() : '');
    }

    // Expecting columns: Title, Description, Category, Priority
    const title = matches[0] || matches[1] || '';
    if (!title) continue;

    const description = matches[1] || '';
    const category = matches[2] || 'General';
    const priority = matches[3] || 'Normal';

    newTasks.push({
      title,
      description,
      category,
      priority,
      status: 'To Test',
      assigned_to: '',
      feedback_notes: '',
      media_url: '',
      bugs: []
    });
  }

  return newTasks;
}
