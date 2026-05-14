import { tool } from "ai"
import { exec as execSync } from "child_process"
import fs from "fs/promises"
import path from "path"
import { promisify } from "util"
import { z } from "zod"

const execAsync = promisify(execSync)

interface Sandbox {
  readFile(path: string, encoding: "utf-8"): Promise<string>
  readdir(
    path: string,
    opts: { withFileTypes: true }
  ): Promise<{ name: string; isDirectory(): boolean }[]>
  exec(command: string): Promise<{ stdout: string; stderr: string }>
}

export const callOptionsSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      path: z.string(),
    })
  ),
  sandbox: z.custom<Sandbox>(),
})

export const readFileTool = tool({
  description: "Read a file from the filesystem",
  inputSchema: z.object({ path: z.string() }),
  execute: async ({ path }, { experimental_context }) => {
    const { sandbox } = experimental_context as { sandbox: Sandbox }
    return sandbox.readFile(path, "utf-8")
  },
})

export const bashTool = tool({
  description: "Execute a bash command",
  inputSchema: z.object({ command: z.string() }),
  execute: async ({ command }, { experimental_context }) => {
    const { sandbox } = experimental_context as { sandbox: Sandbox }
    return sandbox.exec(command)
  },
})

export function createSandbox(options: { workingDirectory: string }): Sandbox {
  const { workingDirectory } = options
  return {
    readFile: async (filePath: string, encoding: "utf-8") => {
      const resolvedPath = path.resolve(workingDirectory, filePath)
      return fs.readFile(resolvedPath, { encoding })
    },
    readdir: async (dirPath: string, opts: { withFileTypes: true }) => {
      const resolvedPath = path.resolve(workingDirectory, dirPath)
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true })
      return entries.map((entry) => ({
        name: entry.name,
        isDirectory: () => entry.isDirectory(),
      }))
    },
    exec: async (command: string) => {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDirectory,
      })
      return { stdout, stderr }
    },
  }
}
