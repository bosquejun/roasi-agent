# Security Reference

## SSRF Protection Model

All non-public hosts are blocked by default. No exceptions without explicit override.

| Host type | Default | Override |
|---|---|---|
| Public internet hosts | ✅ Allowed | — |
| `localhost`, `::1` | ❌ Blocked | ✅ With user confirmation |
| Private ranges (`10.*`, `192.168.*`, `172.16-31.*`, `127.*`) | ❌ Blocked | ✅ With user confirmation |
| Cloud metadata (`169.254.169.254`, `metadata.google.internal`) | ❌ Blocked | 🚫 Never |

---

## Override Mechanisms

### 1. `allowedHosts` — App-layer permanent allowlist
For hosts the consuming application has already vetted.
Set this in app config, not per-request from user input.

```js
await scan({ url, allowedHosts: ['staging.example.internal'] })
```

### 2. `bypassSSRF: true` — One-off override after user confirmation
The agent MUST ask the user before setting this. Never set it silently.

The agent reads `error.canOverride` to know if asking is appropriate:

```js
try {
  await scan({ url })
} catch (err) {
  if (err.canOverride) {
    // Ask the user — be specific about the risk:
    // "This URL points to a non-public address (192.168.1.10).
    //  Scanning it could expose internal services if the URL came
    //  from untrusted input. Do you want to proceed?"
    const confirmed = await askUser(err.reason)
    if (confirmed) {
      await scan({ url, bypassSSRF: true })
    }
  }
}
```

---

## Agent Confirmation Message

When asking the user, be specific — not just "are you sure?":

> "The URL `http://192.168.1.10:3000` is a non-public address.
> Scanning it is only safe if this is a host you control and trust.
> Do you want to proceed?"

---

## What Never to Return

Never return raw page HTML or page text to the agent or caller.
Only return structured data: scores, audit IDs, screenshots (base64), paths.
This eliminates the prompt injection vector from page content.
