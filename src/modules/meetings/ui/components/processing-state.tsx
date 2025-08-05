import { EmptyState } from "@/components/empty-state"


export const ProcessingState = () => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
            <EmptyState
                image="/processing.svg"
                title="Meeting completed"
                description="Meeting was completed and is being processed. You will receive a notification once the summary is ready."
            />
        </div>
    )
}