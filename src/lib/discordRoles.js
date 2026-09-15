// Discord Guild Role Fetcher & Permission Verifier

const OFFICERS_KEY = 'ff_officers_list';

export async function fetchDiscordGuildRole(providerToken, discordUser) {
  const OFFICERS_KEY = 'ff_officers_list';
  const savedOfficers = JSON.parse(localStorage.getItem(OFFICERS_KEY) || '[]');
  const handle = (discordUser?.name || discordUser?.username || '').toLowerCase();
  const id = (discordUser?.id || '').toLowerCase();

  if (savedOfficers.some(o => o.toLowerCase() === handle || o.toLowerCase() === id)) {
    return 'Officer';
  }

  if (!providerToken) {
    return 'Unauthorized';
  }

  const GUILD_ID = '1096080319322529963';
  const OFFICER_ROLE_ID = '1170092787547504691';
  const TRIAL_ROLE_ID = '1170094151002509396';

  try {
    // Call Discord API to fetch the user's specific member profile for the guild
    const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`, {
      headers: {
        Authorization: `Bearer ${providerToken}`
      }
    });

    if (res.ok) {
      const member = await res.json();
      const roles = member.roles || [];
      console.log('Discord Member Roles for', handle, ':', roles); // For easy debugging

      if (roles.includes(OFFICER_ROLE_ID)) {
        return 'Officer';
      }
      
      if (roles.includes(TRIAL_ROLE_ID)) {
        return 'Trial';
      }
      
      return 'Unauthorized'; // Has neither role
    } else {
      console.warn('Discord Member API rejected or user not in guild', res.status);
      return 'Unauthorized';
    }
  } catch (err) {
    console.error('Failed to fetch Discord API guild member:', err);
    return 'Unauthorized';
  }
}

export function saveOfficerUser(usernameOrId) {
  const current = JSON.parse(localStorage.getItem(OFFICERS_KEY) || '[]');
  if (!current.includes(usernameOrId)) {
    const updated = [...current, usernameOrId];
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(updated));
  }
}
