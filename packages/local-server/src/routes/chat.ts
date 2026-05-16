// import { appendConversation, readConversations } from "@roaster/ai/tools/memory"
// import type { SkillMetadata } from "@roaster/ai/tools/skills"
// import type { UIMessage } from "ai"
// import { generateId } from "ai"
// import { Hono } from "hono"
// import { buildInstructions } from "../lib/skills.js"
// import { processChatStream } from "../services/ai-stream.js"

// export function createChatRouter(skills: SkillMetadata[]) {
//   const chat = new Hono()

//   const instructions = buildInstructions(skills)

//   chat.get("/history", async (c) => {
//     const history = await readConversations()
//     const messages: UIMessage[] = history.map((entry) => ({
//       id: generateId(),
//       role: entry.role,
//       parts: entry.parts as UIMessage["parts"],
//     }))
//     return c.json({ messages })
//   })

//   chat.post("/", async (c) => {
//     const body = await c.req.json<{
//       message?: UIMessage
//       messages?: UIMessage[]
//     }>()
//     const userMsg = body.message ?? body.messages?.[body.messages.length - 1]

//     const history = await readConversations()
//     const historyMessages: UIMessage[] = history.slice(-20).map((entry) => ({
//       id: generateId(),
//       role: entry.role,
//       parts: entry.parts as UIMessage["parts"],
//     }))

//     const fullMessages = userMsg
//       ? [...historyMessages, userMsg]
//       : historyMessages

//     if (userMsg) {
//       await appendConversation({
//         role: userMsg.role as "user" | "assistant",
//         parts: userMsg.parts,
//         timestamp: new Date().toISOString(),
//       })
//     }

//     const stream = await processChatStream(
//       fullMessages,
//       skills,
//       instructions,
//       async (parts) => {
//         await appendConversation({
//           role: "assistant",
//           parts,
//           timestamp: new Date().toISOString(),
//         })
//       }
//     )

//     return stream
//   })

//   return chat
// }
