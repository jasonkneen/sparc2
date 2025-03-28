/**
 * Analyze Command module for SPARC 2.0
 * Implements the analyze command for the CLI
 */

import { logInfo } from "../logger.ts";
import { FileToProcess, SPARC2Agent } from "../agent/agent.ts";

// Define types for command arguments and options
interface AnalyzeCommandArgs {
  [key: string]: any;
}

interface AnalyzeCommandOptions {
  files: string;
  model: string;
  mode: string;
  "diff-mode": string;
  processing: string;
  output?: string;
}

/**
 * Utility function to handle errors
 * @param message Error message
 * @param error Error object
 */
function handleError(message: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${message}: ${errorMessage}`);
}

/**
 * Analyze command action
 * @param args Command arguments
 * @param options Command options
 */
export async function analyzeCommand(
  args: AnalyzeCommandArgs,
  options: AnalyzeCommandOptions,
): Promise<void> {
  try {
    // Parse file paths
    const filePaths = options.files.split(",").map((f: string) => f.trim());

    // Read file contents
    const files: FileToProcess[] = [];
    for (const path of filePaths) {
      try {
        const content = await Deno.readTextFile(path);
        files.push({
          path,
          originalContent: content,
        });
      } catch (error) {
        handleError(`Error reading file ${path}`, error);
        throw error;
      }
    }

    // Initialize agent
    const agent = new SPARC2Agent({
      model: options.model,
      mode: options.mode,
      diffMode: options["diff-mode"],
      processing: options.processing,
    });
    await agent.init();

    // Analyze changes
    const analysis = await agent.planAndExecute("Analyze code without making changes", files);

    // Output results
    if (options.output) {
      try {
        await Deno.writeTextFile(options.output, JSON.stringify(analysis, null, 2));
        logInfo(`Analysis written to ${options.output}`);
      } catch (error) {
        handleError(`Error writing to output file`, error);
        throw error;
      }
    } else {
      logInfo("Analysis Results:");
      console.log(JSON.stringify(analysis, null, 2));
    }
  } catch (error: unknown) {
    handleError("Error", error);
    Deno.exit(1);
  }
}