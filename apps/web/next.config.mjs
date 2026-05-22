import { withWorkflow } from "workflow/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@roaster/ui", "@roaster/sprite-animations"],
  serverExternalPackages: ["@mongodb-js/zstd", "just-bash"],
}

export default withWorkflow(nextConfig)
