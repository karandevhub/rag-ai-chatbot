'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModelSelector } from '@/components/custom/model-selector';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './custom/icons';
import { Bot, BrainCircuit } from 'lucide-react';
import { SidebarToggle } from './custom/sidebar-toggle';
import { useWindowSize } from 'usehooks-ts';
import { useSidebar } from './sidebar';

export function ChatHeader({
    clearHistory,
}: {
    clearHistory?: () => void;
}) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { width: windowWidth } = useWindowSize();
    const { open } = useSidebar()

    return (
        <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
            <SidebarToggle />
            {(!open || windowWidth < 768) && (
                <BetterTooltip content="New Chat">
                    <Button
                        variant="outline"
                        className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                        onClick={clearHistory}
                    >
                        <PlusIcon />
                        <span className="md:sr-only">New Chat</span>
                    </Button>
                </BetterTooltip>
            )}

            {isHome && (
                <ModelSelector
                    className="order-1 md:order-2"
                />
            )}
            <Button
                className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 md:flex md:px-4 px-3 order-4 md:ml-auto"
                asChild
            >
                <Link href={isHome ? '/teach' : '/'}>
                    {isHome ? <BrainCircuit size={20} /> : <Bot size={20} />}
                    <span>{isHome ? 'Train' : 'Chat'}</span>
                </Link>
            </Button>
        </header>
    );
}