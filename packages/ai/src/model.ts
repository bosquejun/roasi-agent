import { mistral } from "@ai-sdk/mistral"
import { type LanguageModel, wrapLanguageModel } from "ai"
import { cachedResponseMiddleware } from "./middleware/cached-response-middleware"

export const cachedModel: LanguageModel = wrapLanguageModel({
  model: mistral("mistral-large-latest"),
  middleware: [cachedResponseMiddleware],
})
