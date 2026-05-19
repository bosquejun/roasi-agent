export const isTurnstileEnabled = () => !!process.env.TURNSTILE_SECRET_KEY

export async function verifyTurnstile(token: string): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Turnstile siteverify request failed: HTTP ${res.status}`)
  }

  const data = (await res.json()) as {
    success: boolean
    "error-codes"?: string[]
  }
  if (!data.success) {
    throw new Error(
      `Turnstile verification failed: ${data["error-codes"]?.join(", ") ?? "unknown error"}`
    )
  }
}
