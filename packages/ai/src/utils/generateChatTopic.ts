import { mistral } from "@ai-sdk/mistral"
import { generateText } from "ai"

const model = mistral("mistral-small-latest")

export async function generateChatTopic(
  firstUserText: string,
  instructions: string
): Promise<string> {
  const fallback = firstUserText.slice(0, 60)
  try {
    const { text } = await generateText({
      model,
      prompt: `
You are generating concise chat topics for a conversation list.

The assistant has these capabilities/instructions:
"""
${instructions.slice(0, 800)}
"""

Based on the user's first message AND the assistant's actual capabilities, generate:
- a natural, searchable chat topic
- 3 to 7 words only
- title case
- specific and meaningful, reflecting what the assistant will actually do
- no quotes, emojis, periods, or prefixes
- avoid vague titles like "Help Needed" or "Question"

User message:
"""
${firstUserText.slice(0, 500)}
"""

Return only the chat topic.
      `.trim(),
    })
    if (text.trim()) return text.trim()
  } catch {
    // fallback to truncated first message
  }
  return fallback
}
