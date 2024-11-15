'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/custom/model-selector';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

import { PlusIcon } from './custom/icons';
import { Bot, BrainCircuit } from 'lucide-react';



export function ChatHeader({ selectedModelId, onClose}: { selectedModelId?: string, onClose?: () => void}) {
    const pathname = usePathname()
    const isHome = pathname === '/'
    return (
        <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">

           { isHome && <BetterTooltip content="New Chat">
                <Button
                    variant="outline"
                    className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                    onClick={onClose}
                >
                    <PlusIcon />
                    <span className="md:sr-only">New Chat</span>
                </Button>
            </BetterTooltip>}

            {isHome && <ModelSelector
                selectedModelId={selectedModelId}
                className="order-1 md:order-2"
            />}
            <Button
                className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
                asChild
            >
                <Link
                    href={isHome ? '/teach' : '/'}
                    className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                    {isHome ? <BrainCircuit size={18} /> : <Bot size={18} />}
                    <span>{isHome ? 'Train' : 'Chat'}</span>
                </Link>
            </Button>
        </header>
    );
}
