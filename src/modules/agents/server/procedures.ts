import { z } from "zod"
import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
    //TODO: change `getOne` to use protectedProcedure
    getOne:protectedProcedure
        .input(z.object({ id: z.string()}))
        .query( async ({ input }) => {
        const [existingAgent] = await db
            .select({
                //todo change to actual count
                meeetingCount: sql<number>`5`,
                ...getTableColumns(agents),
            })
            .from(agents)
            .where(eq(agents.id, input.id));

        return existingAgent;
    }), 
    //TODO: change `getMany` to use protectedProcedure
    getMany:protectedProcedure.query( async () => {
        const data = await db
            .select()
            .from(agents);

        return data;
    }),

    create: protectedProcedure
        .input(agentsInsertSchema)
        .mutation( async ({ input, ctx }) => {
            const [createdAgent] = await db
            .insert(agents)
            .values({
                ...input,
                userId: ctx.auth.user.id,
            })
            .returning();

            return createdAgent;
        }),
})