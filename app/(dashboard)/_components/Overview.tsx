"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { UserSettings } from '@prisma/client'
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { tr } from 'date-fns/locale';
import StatsCards from './StatsCards';
import CategoriesStats from './CategoriesStats';

function Overview({ userSettings }: { userSettings: UserSettings }) {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })

    return (
        <>
            <div className='container flex flex-wrap items-end justify-between gap-2 py-6'>
                <h2 className='pl-4 text-3xl font-bold'>Genel Bakış</h2>
                <div className="flex items-center gap-3">
                    <DateRangePicker
                        locale="tr"
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false}
                        onUpdate={values => {
                            const { from, to } = values.range

                            if (!from || !to) return;
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`Seçilen aralık çok büyük. En fazla ${MAX_DATE_RANGE_DAYS} gün seçilebilir.`)
                                return;
                            }

                            setDateRange({ from, to })
                        }}
                    />

                </div>
            </div>
            <div className="container flex w-full flex-col gap-2">
                <StatsCards
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />

                <CategoriesStats
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />
            </div>
        </>
    )
}

export default Overview
