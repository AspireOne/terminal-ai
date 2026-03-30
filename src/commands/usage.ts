import * as theme from "../theme";
import { ExecutionContext } from "../execution-context/execution-context";
import { ErrorCode, TerminalAIError } from "../lib/errors";

//  Note there is a good overview of new features here:
//  https://openai.com/index/new-embedding-models-and-api-updates/

export async function usage(
  executionContext: ExecutionContext,
): Promise<string | null> {
  const interactive = executionContext.isTTYstdin;
  const config = executionContext.config;
  console.log(
    theme.printWarning(
      `This capability is work-in-progress and experimental only`,
      interactive,
    ),
  );

  //  Check we have an API key.
  if (config.apiKey === "") {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      "your OpenAI API key is not set, try 'ai init'",
    );
  }

  //  Get the beginning of the month. We track from here.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const unixSeconds = Math.floor(startOfMonth.getTime() / 1000);
  const year = startOfMonth.getFullYear();
  const month = String(startOfMonth.getMonth() + 1).padStart(2, "0");
  const day = String(startOfMonth.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  console.log(unixSeconds);
  console.log(formattedDate);

  try {
    const response = await fetch(
      `https://api.openai.com/v1/usage?date=${formattedDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw await buildFetchError(response);
    }

    console.log(JSON.stringify(await response.json()));
  } catch (error: unknown) {
    console.error("Error fetching usage:", getErrorMessage(error));
  }
  try {
    const response = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?date=${unixSeconds}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw await buildFetchError(response);
    }

    console.log(await response.json());
  } catch (error: unknown) {
    console.error("Error fetching usage:", getErrorMessage(error));
  }

  return "";
}

async function buildFetchError(response: Response): Promise<Error> {
  const body = await response.text();
  return new Error(body || `${response.status} ${response.statusText}`);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
