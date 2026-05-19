export async function verifyTurnstile(token: string): Promise<void> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    }
  )
  const data = (await res.json()) as {
    success: boolean
    "error-codes"?: string[]
  }
  if (!data.success) {
    throw new Error(
      `Turnstile verification failed: ${data["error-codes"]?.join(", ")}`
    )
  }
}
