"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React, { ReactNode, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { Category } from '@prisma/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface Props {
    type: TransactionType;
    successCallback: (category: Category) => void;
    trigger?: ReactNode;
}

function CreateCategoryDialog({ type, successCallback, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type,
        }
    })

    const queryClient = useQueryClient();
    const theme = useTheme();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                icon: "",
                type,
            })

            toast.success(`${data.name} kategorisi başarıyla oluşturuldu.`, {
                id: "kategori-olustur",
            })

            successCallback(data);

            await queryClient.invalidateQueries({
                queryKey: ["kategoriler"],
            })

            setOpen((prev) => !prev)
        },
        onError: () => {
            toast.error("Bir şeyler ters gitti", {
                id: "kategori-olustur"
            })
        }
    })

    const onSubmit = useCallback((values: CreateCategorySchemaType) => {
        toast.loading("Kategori oluşturuluyor...", {
            id: "kategori-olustur"
        })
        mutate(values);
    },
        [mutate]
    )

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {trigger ? (
                trigger
            ) : (
                <Button
                    variant={"ghost"}
                    className='flex border-separate items-center 
                    justify-start roudned-none border-b px-3 py-3 text-muted-foreground'>
                    <PlusSquare className='mr-2 h-4 w-4' />
                    Yeni Oluştur
                </Button>
            )}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Oluştur
                    <span
                        className={cn(
                            "m-1",
                            type === "gelir" ? "text-emerald-500"
                                : "text-red-500"
                        )}
                    >
                        {type}
                    </span>
                    Kategori
                </DialogTitle>
                <DialogDescription>
                    Kategoriler yardımıyla işlemleriniz gruplandırabilirsiniz.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>İsim</FormLabel>
                                <FormControl>
                                    <Input placeholder='Kategori' {...field} />
                                </FormControl>
                                <FormDescription>
                                    Kategoriniz uygulamada böyle gözükecek
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>İkon</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className='h-[100px] w-full'
                                            >
                                                {form.watch("icon") ? (
                                                    <div className='flex flex-col items-center gap-2'>
                                                        <span className="text-5xl" role='img'>
                                                            {field.value}
                                                        </span>
                                                        <p className="text-xs text-muted-foreground">
                                                            Değiştirmek için tıkla
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className='flex flex-col items-center gap-2'>
                                                        <CircleOff className='h-[48px] w-[48px]' />
                                                        <p className="text-xs text-muted-foreground">
                                                            Seçmek için tıkla
                                                        </p>
                                                    </div>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-full'>
                                            <Picker
                                                data={data}

                                                theme={theme.resolvedTheme}
                                                onEmojiSelect={(emoji: { native: string }) => {
                                                    field.onChange(emoji.native);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    Kategoriniz uygulamada böyle gözükecek
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type='button'
                        variant={"secondary"}
                        onClick={() => {
                            form.reset();
                        }}>
                        İptal
                    </Button>
                </DialogClose>
                <Button onClick={form.handleSubmit(onSubmit)} disabled=
                    {isPending}>
                    {!isPending && "Oluştur"}
                    {isPending && <Loader2 className='animate-spin' />}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export default CreateCategoryDialog
