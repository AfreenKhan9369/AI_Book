import serverless from "serverless-http";
import { app, ensureDatabase } from "../../server/app.js";

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  // Ensure DB tables and default records exist on cold starts
  await ensureDatabase();

  return serverlessHandler(event, context);
};
