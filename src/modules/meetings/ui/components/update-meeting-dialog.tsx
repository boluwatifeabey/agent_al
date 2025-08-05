import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../../types";


interface UpdateMeetingDialogProp {
    open: boolean;
    onOpenChange: ( open: boolean ) => void;
    initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog = ({
    open,
    onOpenChange,
    initialValues,
}: UpdateMeetingDialogProp) => {
    return (
        <ResponsiveDialog 
            title="Edit Meeting"
            description="Edit the Meeting details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )
}