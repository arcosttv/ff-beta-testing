// Discord Guild Role Fetcher & Permission Verifier

const OFFICERS_KEY = 'ff_officers_list';

// Helper to check if a user is an Officer
export async function fetchDiscordGuildRole(providerToken, discordUser) {
  // Check if manual Officer allowlist includes this user
  const savedOfficers = JSON.parse(localStorage.getItem(OFFICERS_KEY) || '[]');
  const handle = (discordUser?.name || discordUser?.username || '').toLowerCase();
  const id = (discordUser?.id || '').toLowerCase();

  if (savedOfficers.some(o => o.toLowerCase() === handle || o.toLowerCase() === id)) {
    return 'Officer';
  }

  if (!providerToken) {
    return 'Trial';
  }

  try {
    // Call Discord API to fetch user's guilds and permission bitfields
    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${providerToken}`
      }
    });

    if (res.ok) {
      const guilds = await res.json();
      
      for (const g of guilds) {
        const perms = BigInt(g.permissions || '0');
        const ADMINISTRATOR = BigInt(0x8);
        const MANAGE_GUILD = BigInt(0x20);

        // If user has Administrator or Manage Guild in any guild -> Officer!
        if ((perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD || g.owner) {
          return 'Officer';
        }
      }
      return 'Raider';
    }
  } catch (err) {
    console.warn('Failed to fetch Discord API guilds, using default role:', err);
  }

  return 'Trial';
}

export function saveOfficerUser(usernameOrId) {
  const current = JSON.parse(localStorage.getItem(OFFICERS_KEY) || '[]');
  if (!current.includes(usernameOrId)) {
    const updated = [...current, usernameOrId];
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(updated));
  }
}
