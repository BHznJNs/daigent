import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchProviderModels } from "@/api/llm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Provider } from "@/types/provider";

type ModelSelectorDialogProps = {
  provider: Provider;
  isOpen: boolean;
  existingModels: string[];
  onClose: () => void;
  onConfirm: (selectedModels: string[]) => void;
};

export function ModelSelectorDialog({
  provider,
  isOpen,
  existingModels = [],
  onClose,
  onConfirm,
}: ModelSelectorDialogProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const {
    data: availableModels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["provider-models", provider.id],
    queryFn: () =>
      fetchProviderModels(provider.type, provider.base_url, provider.api_key),
    enabled: isOpen,
  });

  useEffect(() => {
    if (availableModels.length > 0 && existingModels.length > 0) {
      const validExistingModels = existingModels.filter((modelId) =>
        availableModels.some((model) => model.id === modelId)
      );
      setSelectedModels(validExistingModels);
    }
  }, [availableModels, existingModels]);

  const handleToggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((selectedModel) => selectedModel !== modelId);
      }
      return [...prev, modelId];
    });
  };

  const handleConfirm = () => {
    if (selectedModels.length === 0) {
      toast.error("请至少选择一个模型", {
        description: "至少选择一个模型添加到服务提供商。",
      });
      return;
    }

    onConfirm(
      selectedModels.filter((modelId) => !existingModels.includes(modelId))
    );
    setSelectedModels([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedModels([]);
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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

    if (error) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>获取模型失败</EmptyTitle>
            <EmptyDescription>
              无法获取 {provider.name} 的模型列表，请稍后重试。
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }

    if (availableModels.length === 0) {
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
        {availableModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);

          return (
            <Item variant="outline" key={model.id}>
              <ItemContent>
                <span className="font-medium">{model.id}</span>
              </ItemContent>
              <ItemActions>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggleModel(model.id)}
                />
              </ItemActions>
            </Item>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>选择模型 - {provider.name}</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-muted-foreground text-sm">
          从可用模型中选择需要添加的模型：
        </p>

        <ScrollArea className="mr-[-5px] h-[60vh] pr-[5px]">
          {renderContent()}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
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
