import type { FastifyPluginCallback } from "fastify";
import providerRoutes from "./provider";

const settingsRoute: FastifyPluginCallback = (fastify) => {
  fastify.register(providerRoutes, { prefix: "/providers" });
};

export default settingsRoute;
