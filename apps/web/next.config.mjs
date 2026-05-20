/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@roaster/ui", "@roaster/sprite-animations"],
  serverExternalPackages: ["@mongodb-js/zstd", "just-bash"],
  outputFileTracingIncludes: {
    "/api/roast": ["../../packages/ai/src/agents/roasi/prompts/**/*"],
    "/api/roast/worker": ["../../packages/ai/src/agents/roasi/prompts/**/*"],
    "/api/chat": ["../../packages/ai/src/agents/roasi/prompts/**/*"],
  },
}

export default nextConfig
