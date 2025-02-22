"use client";

import { DateToUTCDate } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { getTransactionsHistoryResponseType } from '@/app/api/transactions-history/route';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader';
import { cn } from '@/lib/utils';
import { DataTableFacetedFilter } from '@/components/datatable/FacetedFilters';
import { DataTableViewOptions } from '@/components/datatable/ColumnToggle';
import { Button } from '@/components/ui/button';

import { download, generateCsv, mkConfig } from "export-to-csv";
import { DownloadIcon, MoreHorizontal, TrashIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DeleteTransactionDialog from './DeleteTransactionDialog';

interface Props {
    from: Date;
    to: Date;
}

const emptyData: any[] = []

type TransactionHistoryRow = getTransactionsHistoryResponseType[0];
const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: "category", //kategori
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Kategori' />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => (
            <div className="flex gap-2 capitalize">
                {row.original.categoryIcon}
                <div className="capitalize">
                    {row.original.category}
                </div>
            </div>
        )
    },
    {
        accessorKey: "description", //description
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Açıklama' />
        ),
        cell: ({ row }) => (
            <div className="capitalize">
                {row.original.description}
            </div>
        )
    },
    {
        accessorKey: "date", //tarih
        header: "Tarih",
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            const formattedDate = date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: "UTC",
            });
            return <div className="text-muted-foreground">{formattedDate}</div>
        }
    },
    {
        accessorKey: "type", //tip
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tip' />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => (
            <div className={cn("capitalize rounded-lg text-center p-2",
                row.original.type === "gelir" && "bg-emerald-400/10 text-emerald-500",
                row.original.type === "gider" && "bg-red-400/10 text-red-500"
            )}>
                {row.original.type}
            </div>
        )
    },
    {
        accessorKey: "amount", //miktar
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Miktar' />
        ),
        cell: ({ row }) => (
            <p className="text-md rounded-lg bbg-gray-400/5 p-2 text-center font-medium">
                {row.original.formattedAmount}
            </p>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <RowActions transaction={row.original} />,
    }
];

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
})


function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const history = useQuery<getTransactionsHistoryResponseType>({
        queryKey: ["transactions", "history", from, to],
        queryFn: () => fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res) => res.json()),
    })

    const handleExportCSV = (data: any[]) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const categoriesOptions = useMemo(() => {
        const categoriesMap = new Map()
        history.data?.forEach((transaction) => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.categoryIcon} ${transaction.category}`,
            })
        })
        const uniqueCategories = new Set(categoriesMap.values())
        return Array.from(uniqueCategories)
    }, [history.data])

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-2 py-4 pl-4">
                <div className="flex gap-2">
                    {table.getColumn("category") && (
                        <DataTableFacetedFilter
                            title='Kategori'
                            column={table.getColumn("category")}
                            options={categoriesOptions}
                        />
                    )}
                    {table.getColumn("type") && (
                        <DataTableFacetedFilter
                            title='Tip'
                            column={table.getColumn("type")}
                            options={[
                                { label: "Gelir", value: "gelir" },
                                { label: "Gider", value: "gider" },
                            ]}
                        />
                    )}
                </div>
                <div className="flex flex-wrap gap-2 pr-4">
                    <Button variant={"outline"} size={"sm"} className='ml-auto h-8 lg:flex' onClick={() => {
                        const data = table.getFilteredRowModel().rows.map((row) =>
                        ({
                            Kategori: row.original.category,
                            KategoriSimgesi: row.original.categoryIcon,
                            Açıklama: row.original.description,
                            Tarih: row.original.date,
                            Tip: row.original.type,
                            Miktar: row.original.amount,
                            BiçimlendirilmişMiktar: row.original.formattedAmount,
                        }))
                        handleExportCSV(data);
                    }} >
                        <DownloadIcon className='mr-2 h-4 w-4' />
                        CSV İndir
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <SkeletonWrapper isLoading={history.isFetching}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Sonuç Yok
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4 pr-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Önceki
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Sonraki
                    </Button>
                </div>
            </SkeletonWrapper>
        </div>
    )
}

export default TransactionTable

function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DeleteTransactionDialog open={showDeleteDialog} setOpen=
                {setShowDeleteDialog} transactionId={transaction.id} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className='h-8 w-8 p-0'>
                        <span className="sr-only">Menüyü Aç</span>
                        <MoreHorizontal className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='flex items-center gap-2 ' onSelect=
                        {() => { setShowDeleteDialog((prev) => !prev) }}>
                        <TrashIcon className='h-4 w-4 text-muted-foreground' />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
