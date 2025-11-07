import cors from "@fastify/cors";
import Fastify from "fastify";
import minimist from "minimist";
import settingsRoute from "./routes/settings";

async function main(args: minimist.ParsedArgs) {
  const port = Number.parseInt(args.port, 10);
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors);
  await fastify.register(settingsRoute, { prefix: "/api/settings" });

  try {
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main(minimist(process.argv.slice(2)));
