import { eq } from "drizzle-orm";
import type { FastifyPluginCallback } from "fastify";
import { db } from "../../db";
import { type Provider, providers } from "../../db/schemas";

const providerRoutes: FastifyPluginCallback = (fastify) => {
  // GET /api/settings/providers - Get all providers
  fastify.get("/", async (_request, reply) => {
    try {
      const allProviders = await db.select().from(providers);
      return reply.send(allProviders);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // GET /api/settings/providers/:id - Get a single provider by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const provider = await db
        .select()
        .from(providers)
        .where(eq(providers.id, Number(id)));

      if (provider.length === 0) {
        return reply.status(404).send({ error: "Provider not found" });
      }

      return reply.send(provider[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // POST /api/settings/providers - Create a new provider
  fastify.post("/", async (request, reply) => {
    try {
      const newProvider: Provider = request.body as Provider;
      const insertedProvider = await db
        .insert(providers)
        .values(newProvider)
        .returning();
      return reply.status(201).send(insertedProvider[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // PUT /api/settings/providers/:id - Update a provider by ID
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updatedProvider = request.body as Partial<Provider>;

      const result = await db
        .update(providers)
        .set({ ...updatedProvider })
        .where(eq(providers.id, Number(id)))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: "Provider not found" });
      }

      return reply.send(result[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // DELETE /api/settings/providers/:id - Delete a provider by ID
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await db
        .delete(providers)
        .where(eq(providers.id, Number(id)))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ error: "Provider not found" });
      }

      return reply.send({ message: "Provider deleted successfully" });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
};

export default providerRoutes;
