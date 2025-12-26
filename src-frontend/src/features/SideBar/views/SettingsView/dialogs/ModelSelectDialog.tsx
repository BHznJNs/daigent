import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchProviderModels } from "@/api/llm";
import { SelectionItem } from "@/components/custom/item/SelectionItem";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProviderBase } from "@/types/provider";

type ModelSelectDialogProps = {
  children: React.ReactNode;
  provider: ProviderBase;
  existingModels: string[];
  onCancel?: () => void;
  onConfirm?: (selectedModels: string[]) => void;
};

function ModelSelectSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ModelSelectDialog({
  children,
  provider,
  existingModels: existingModelArr,
  onCancel,
  onConfirm,
}: ModelSelectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const existingModels = new Set(existingModelArr);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const {
    data: availableModels,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["provider-models", provider.name, provider.base_url],
    queryFn: () =>
      fetchProviderModels(provider.type, provider.base_url, provider.api_key),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);

  useEffect(() => {
    if (availableModels) {
      const validExistingModels = availableModels.filter((modelId) =>
        existingModels.has(modelId)
      );
      setSelectedModels(validExistingModels);
    }
  }, [availableModels]);

  const handleToggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((selectedModel) => selectedModel !== modelId);
      }
      return [...prev, modelId];
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm?.(selectedModels);
    setSelectedModels([]);
  };

  const content = () => {
    if (isLoading) {
      return <ModelSelectSkeleton />;
    }

    if (error) {
      return (
        <FailedToLoad
          refetch={() => refetch()}
          description={`无法获取 ${provider.name} 的模型列表，请稍后重试。`}
        />
      );
    }

    if (availableModels === undefined) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>暂无可用模型</EmptyTitle>
            <EmptyDescription>该服务商当前没有可用的模型。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <div className="space-y-3">
        {availableModels.map((modelId) => {
          const isSelected = selectedModels.includes(modelId);

          return (
            <SelectionItem
              key={modelId}
              value={modelId}
              label={modelId}
              isSelected={isSelected}
              handleToggle={handleToggleModel}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>选择模型 - {provider.name}</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-muted-foreground text-sm">
          从可用模型中选择需要添加的模型：
        </p>

        <ScrollArea className="mr-[-5px] h-[60vh] pr-[5px]">
          {content()}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button onClick={onCancel} variant="outline">
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={selectedModels.length === 0}
          >
            确认添加 ({selectedModels.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
