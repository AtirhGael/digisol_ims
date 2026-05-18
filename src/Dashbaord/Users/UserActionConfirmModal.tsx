import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface UserProps {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
}

interface UserActionConfirmModalProps {
  isOpen: boolean;
  user: UserProps | null;
  actionType: 'deactivate' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserActionConfirmModal({ isOpen, user, actionType, onConfirm, onCancel, isLoading }: UserActionConfirmModalProps) {
  if (!user) return null;

  const isDeactivate = actionType === 'deactivate';

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeactivate ? 'Deactivate User' : 'Delete User'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDeactivate ? (
              <>
                Are you sure you want to deactivate the account of{' '}
                <span className="font-semibold text-gray-900">{user.first_name} {user.last_name}</span>?
                This will prevent the user from logging in. All user data and history will be preserved.
              </>
            ) : (
              <>
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-gray-900">{user.first_name} {user.last_name}</span>?
                This action cannot be undone. All user data will be permanently removed from the system.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow disabled:pointer-events-none disabled:opacity-50 ${
              isDeactivate
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isDeactivate ? 'Deactivating...' : 'Deleting...'}
              </>
            ) : (
              isDeactivate ? 'Deactivate User' : 'Delete User'
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default UserActionConfirmModal;
