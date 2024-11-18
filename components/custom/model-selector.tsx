'use client';

import { startTransition, useMemo, useState, useEffect } from 'react';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CheckCirclFillIcon, ChevronDownIcon } from './icons';

export function ModelSelector({ className }: React.ComponentProps<typeof Button>) {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_NAME);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedModelId = localStorage.getItem('model-id') || DEFAULT_MODEL_NAME;
    setSelectedModelId(storedModelId);
  }, []);

  const selectModel = useMemo(
    () => models.find((model) => model.id === selectedModelId),
    [selectedModelId]
  );

  const handleModelSelect = (modelId: string) => {
    startTransition(() => {
      localStorage.setItem('model-id', modelId);
      setSelectedModelId(modelId);
      setOpen(false);
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectModel?.label.split(' ')[0]}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => handleModelSelect(model.id)}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={model.id === selectedModelId}
          >
            <div className="flex flex-col gap-1 items-start">
              {model.label}
              {model.description && (
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
              )}
            </div>
            <div className="text-primary dark:text-primary-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCirclFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}