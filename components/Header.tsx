'use client'

import React, { FC } from 'react'
import Link from 'next/link'
import { Bot,BrainCircuit } from 'lucide-react'
import { usePathname } from 'next/navigation'


interface Props {
    clearHistory?: () => void,
}

const Header: FC<Props> = ({ clearHistory }) => {
    const pathname = usePathname()

    const isHome = pathname === '/'

    return (
        <header className="sticky top-0 z-10 bg-background">
            <div className="container mx-auto px-2 py-3 flex items-center">
                <h1 className="text-xl font-semibold">R.A.G</h1>
                <div className="ml-auto flex items-center space-x-4">
                    <Link
                        href={isHome ? '/teach' : '/'}
                        className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {isHome ? <BrainCircuit size={18} /> : <Bot size={18} />}
                        <span>{isHome ? 'Train' : 'Chat'}</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header
