"use client";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { ReactNode, useCallback, useState } from "react";
import { format } from 'date-fns';
import { tr } from "date-fns/locale";


interface Props {
    trigger: ReactNode;
    type: TransactionType;
}

import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, ReceiptRussianRuble } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import 'react-day-picker/dist/style.css';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { date } from "zod";



function CreateTransactionDialog({ trigger, type }: Props) {
    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            type,
            date: new Date(),
        }
    })

    const [open, setOpen] = useState(false);
    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value)
    },
        [form]
    )

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateTransaction,
        onSuccess: () => {
            toast.success("İşlem başarıyla oluşturuldu", {
                id: "create-transaction",
            })

            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined,
            })

            queryClient.invalidateQueries({
                queryKey: ["overview"],
            })

            setOpen((prev) => !prev)
        }
    })

    const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading("İşlem oluşturuluyor...", {
            id: "create-transaction"
        })
        mutate({
            ...values,
            date: DateToUTCDate(values.date),

        })
    },
        [mutate]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Yeni{" "}
                        <span className={cn(
                            "m-1",
                            type === "gelir" ? "text-emerald-500" : "text-red-500"
                        )}>
                            {type}
                        </span>
                        işlemi oluştur
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Input defaultValue={""} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        İşlem Açıklaması (İsteğe bağlı)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Değer</FormLabel>
                                    <FormControl>
                                        <Input defaultValue={0} type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        İşlem Değeri (Gerekli)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        {/* İşlem: {form.watch("category")} */}
                        <div className="flex items-center justify-between gap-2">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Kategori</FormLabel>
                                        <FormControl>
                                            <CategoryPicker type={type} onChange=
                                                {handleCategoryChange} />
                                        </FormControl>
                                        <FormDescription>
                                            İşlem için kategori seçin
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>İşlem tarihi</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[200px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: tr })
                                                        ) : (
                                                            <span>Tarih seçin</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    className="rounded-md border"
                                                    locale={tr}
                                                    classNames={{
                                                        months: "space-y-4 px-3",
                                                        month: "space-y-4",
                                                        caption: "flex justify-center pt-1 relative items-center",
                                                        caption_label: "text-sm font-medium",
                                                        nav: "space-x-1 flex items-center",
                                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                                        nav_button_previous: "absolute left-1",
                                                        nav_button_next: "absolute right-1",
                                                        table: "w-full border-collapse space-y-1",
                                                        head_row: "flex",
                                                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                                        row: "flex w-full mt-2",
                                                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                                        day_today: "bg-accent text-accent-foreground",
                                                        day_outside: "text-muted-foreground opacity-50",
                                                        day_disabled: "text-muted-foreground opacity-50",
                                                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                                        day_hidden: "invisible",
                                                    }}
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(value) => {
                                                        if (!value) return;
                                                        field.onChange(value);
                                                    }}
                                                    autoFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            İşlem için bir tarih seçin
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
    )
}

export default CreateTransactionDialog
