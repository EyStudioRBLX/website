const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function sendNewApplicationWebhook(opts: {
  applicantName: string
  positionTitle: string
  gameName: string
  applicationId: string
  appUrl: string
}): Promise<void> {
  if (!WEBHOOK_URL) return
  const { applicantName, positionTitle, gameName, applicationId, appUrl } = opts
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            color: 0x6d28d9,
            title: '📋 Neue Bewerbung eingegangen',
            description: `**${applicantName}** hat sich für **${positionTitle}**${gameName ? ` (${gameName})` : ''} beworben.`,
            fields: [
              {
                name: 'Bewerbung ansehen & entscheiden',
                value: `[Hier klicken](${appUrl}/admin?bewerbung=${applicationId})`,
                inline: false,
              },
            ],
            footer: { text: 'EyStudio Bewerbungssystem' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })
  } catch {
    // silently ignore
  }
}

export async function sendApplicationDecisionWebhook(opts: {
  applicantName: string
  positionTitle: string
  gameName: string
  decision: 'accepted' | 'rejected'
}): Promise<void> {
  if (!WEBHOOK_URL) return
  const { applicantName, positionTitle, gameName, decision } = opts
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            color: decision === 'accepted' ? 0x22c55e : 0xef4444,
            title: decision === 'accepted' ? '✅ Bewerbung angenommen' : '❌ Bewerbung abgelehnt',
            description: `Die Bewerbung von **${applicantName}** für **${positionTitle}**${gameName ? ` (${gameName})` : ''} wurde **${decision === 'accepted' ? 'angenommen' : 'abgelehnt'}**.`,
            footer: { text: 'EyStudio Bewerbungssystem' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })
  } catch {
    // silently ignore
  }
}
