import { PiggyBank, Wallet } from 'lucide-react'
import React from 'react'

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
        {/* logolar için */}
        <Wallet className='stroke h-11 w-11 stroke-blue-700 stroke-[1.5]'/>
        {/* logolar için renkler ayarlanması*/}
        <p className="bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-3xl
        font-bold leading-tight tracking-tighter text-transparent">
            FinancialFreedom
        </p>
    </a>
  )
}

export default Logo
