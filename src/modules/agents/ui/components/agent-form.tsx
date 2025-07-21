import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
// import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


interface AgentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initalValues?: AgentGetOne;
}

export const AgentForm = ({
    onSuccess,
    onCancel,
    initalValues,
}: AgentFormProps) => {
    const trpc = useTRPC();
    // const router = useRouter();
    const queryClient = useQueryClient();
    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions(),
                );

                if (initalValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.agents.getOne.queryOptions({ id: initalValues.id}),
                    );
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);

                //todo: check if error code is "forbidden", redirect to /upgrade

            },
        })
    );
    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initalValues?.name ?? "",
            instructions: initalValues?.instructions ?? "",
        }
    });

    const isEdit = !!initalValues?.id;
    const isPending = createAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit) {
            console.log("TODO: updateAgent")
        } else {
            createAgent.mutate(values);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar
                    seed={form.watch("name")}
                    variant="botttsNeutral"
                    className="border size-16"
                />
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field } placeholder="e.g john" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="instructions"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>instructions</FormLabel>
                            <FormControl>
                                <Textarea 
                                    {...field } 
                                    placeholder="you are a helpful assistants that can answer questions and help with tasks." 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button 
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={() => onCancel()}
                        >Cancel</Button>
                    )}
                    <Button disabled={isPending} type="submit">
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}