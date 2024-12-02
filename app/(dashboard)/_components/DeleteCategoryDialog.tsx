"use client";

import { Category } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { ReactNode } from 'react'
import { DeleteCategory } from '../_actions/categories';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';

interface Props {
    trigger: ReactNode;
    category: Category;
}

function DeleteCategoryDialog({ category, trigger }: Props) {
    const categoryIdentifier = `${category.name}-${category.type}`
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success("Kategori silindi", {
                id: categoryIdentifier,
            })

            await queryClient.invalidateQueries({
                queryKey: ["categories"],
            })
        },
        onError: () => {
            toast.error("Bir şeyler ters gitti", {
                id: categoryIdentifier,
            })
        }
    })
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Silmek istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem kategorinizi kalıcı olarak silecektir. Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading("Kategori siliniyor...", {
                            id: categoryIdentifier,
                        })
                        deleteMutation.mutate({
                            name: category.name,
                            type: category.type as TransactionType,
                        })
                    }}>Sil</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteCategoryDialog
