import { CurrencyComboBox } from '@/components/CurrencyComboBox';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {

    const user = await currentUser();
    if(!user){
        redirect("/sign-in");
    }
  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
        <div>
        <h1 className="text-center text-3xl">
            Hoş Geldin, <span className="m1-2 font-bold">
                {user.firstName}!
            </span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
            Para biriminizi ayarlayarak başlayalım.
        </h2>

        <h3 className="mt-2 text-center text-sm text-muted-foreground">
            Bu ayarı istediğiniz zaman değiştirebilirsiniz.
        </h3>
        </div>
        <Separator />
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>
                    Para Birimi
                </CardTitle>
                <CardDescription>
                    İşlemler için para biriminizi ayarlayınız.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CurrencyComboBox />
            </CardContent>
        </Card>
        <Separator />
        <Button className='w-full' asChild>
            <Link href={"/"}>
            Hazırım! Beni ana sayfaya götür.
            </Link>
        </Button>
        <div className="mt-8"></div>
        <Logo />
    </div>
  )
}

export default page
