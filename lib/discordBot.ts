const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

export async function sendDiscordDM(discordId: string, content: string): Promise<void> {
  if (!BOT_TOKEN) return
  try {
    // Open DM channel with user
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: discordId }),
    })
    if (!dmRes.ok) return

    const { id: channelId } = await dmRes.json()

    // Send message
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
  } catch {
    // silently ignore — DM is best-effort
  }
}
