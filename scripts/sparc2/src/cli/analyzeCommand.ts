/**
 * Analyze Command module for SPARC 2.0
 * Implements the analyze command for the CLI
 */

import { logInfo } from "../logger.ts";
import { FileToProcess, SPARC2Agent } from "../agent/agent.ts";

/**
 * Analyze command action
 * @param args Command arguments
 * @param options Command options
 */
export async function analyzeCommand(
  args: Record<string, any>,
  options: Record<string, any>,
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
        console.error(`Error reading file ${path}: ${error.message}`);
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
        console.log(`Analysis written to ${options.output}`);
      } catch (error) {
        console.error(`Error writing to output file: ${error.message}`);
        throw error;
      }
    } else {
      console.log("Analysis Results:");
      console.log(JSON.stringify(analysis, null, 2));
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    Deno.exit(1);
  }
}
