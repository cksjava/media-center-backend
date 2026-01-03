import { app } from "./app.js";
import { env } from "./config/env.js";
import { syncDb } from "./models/index.js";

async function main() {
  await syncDb();
  app.listen(env.PORT, () => console.log(`API listening on :${env.PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
