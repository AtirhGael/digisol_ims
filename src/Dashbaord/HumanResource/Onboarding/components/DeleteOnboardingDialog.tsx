import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import type { OnboardingRecord } from "../onboardingData";

type DeleteOnboardingDialogProps = {
  open: boolean;
  record: OnboardingRecord | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteOnboardingDialog({
  open,
  record,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteOnboardingDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <AlertDialogContent onOverlayClick={onCancel}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Onboarding Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {record?.name ?? "this onboarding record"}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
