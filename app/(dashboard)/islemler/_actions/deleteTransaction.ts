"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteTransactions(id: string) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in")
    }

    const transaction = await prisma.transaction.findUnique({
        where: {
            id,
            userId: user.id,
        },
    });

    if (!transaction) {
        throw new Error("Geçersiz istek");
    }

    await prisma.$transaction([
        prisma.transaction.delete({
            where: {
                id,
                userId: user.id,
            }
        }),
        prisma.monthHistory.update({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: transaction.date.getUTCDate(),
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                },
            },
            data: {
                ...(transaction.type === "gider" && {
                    expense: {
                        decrement: transaction.amount,
                    },
                }),
                ...(transaction.type === "gelir" && {
                    income: {
                        decrement: transaction.amount,
                    },
                }),
            },
        }),
        prisma.yearHistory.update({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                },
            },
            data: {
                ...(transaction.type === "gider" && {
                    expense: {
                        decrement: transaction.amount,
                    },
                }),
                ...(transaction.type === "gelir" && {
                    income: {
                        decrement: transaction.amount,
                    },
                }),
            },
        }),
    ]);
}