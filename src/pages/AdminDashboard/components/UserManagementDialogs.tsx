/**
 * User Management Dialogs
 * Add and delete user dialog components
 */

import { memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, NewUserForm } from '../dashboard.types';

interface UserManagementDialogsProps {
    showAddDialog: boolean;
    showDeleteDialog: boolean;
    selectedUser: User | null;
    newUserForm: NewUserForm;
    isSaving: boolean;
    onAddDialogChange: (open: boolean) => void;
    onDeleteDialogChange: (open: boolean) => void;
    onFormChange: (form: NewUserForm) => void;
    onAddUser: () => void;
    onDeleteUser: () => void;
}

export const UserManagementDialogs = memo(function UserManagementDialogs({
    showAddDialog,
    showDeleteDialog,
    selectedUser,
    newUserForm,
    isSaving,
    onAddDialogChange,
    onDeleteDialogChange,
    onFormChange,
    onAddUser,
    onDeleteUser,
}: UserManagementDialogsProps) {
    return (
        <>
            {/* Add User Dialog */}
            <Dialog open={showAddDialog} onOpenChange={onAddDialogChange}>
                <DialogContent className="max-w-md bg-slate-800 border border-slate-700 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New User</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Create a new user account in the system
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200">
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                value={newUserForm.name}
                                onChange={(e) => onFormChange({ ...newUserForm, name: e.target.value })}
                                placeholder="John Doe"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">
                                Email *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUserForm.email}
                                onChange={(e) => onFormChange({ ...newUserForm, email: e.target.value })}
                                placeholder="john.doe@university.edu"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-200">
                                Username *
                            </Label>
                            <Input
                                id="username"
                                value={newUserForm.username}
                                onChange={(e) => onFormChange({ ...newUserForm, username: e.target.value })}
                                placeholder="johndoe"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">
                                Password *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUserForm.password}
                                onChange={(e) => onFormChange({ ...newUserForm, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-200">
                                Role *
                            </Label>
                            <Select
                                value={newUserForm.role}
                                onValueChange={(value: 'student' | 'faculty') =>
                                    onFormChange({ ...newUserForm, role: value })
                                }
                            >
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-slate-200">
                                Department
                            </Label>
                            <Input
                                id="department"
                                value={newUserForm.department}
                                onChange={(e) => onFormChange({ ...newUserForm, department: e.target.value })}
                                placeholder="Computer Science"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onAddDialogChange(false)}
                            disabled={isSaving}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onAddUser}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg text-white"
                        >
                            {isSaving ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
                <AlertDialogContent className="bg-slate-800 border border-slate-700 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone and
                            will permanently remove the user from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isSaving}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-200"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteUser}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-white"
                        >
                            {isSaving ? 'Deleting...' : 'Delete User'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
