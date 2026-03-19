import dbg from "debug";
import { expandContext, ExpandedContext } from "../../context/context";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

const debug = dbg("ai:chat-pipeline:build-execute-output-context");

export async function buildExecuteOutputContext(
  params: ChatPipelineParameters,
  env: NodeJS.ProcessEnv,
): Promise<ExpandedContext[]> {
  if (!params.options.enableOutputPrompts) {
    return [];
  }

  const prompts = params.executionContext.config.prompts.execute.output.map(
    (context) => expandContext(context, env),
  );
  debug(`expanded execute output context: ${prompts.length} prompt(s)`);
  return prompts;
}
