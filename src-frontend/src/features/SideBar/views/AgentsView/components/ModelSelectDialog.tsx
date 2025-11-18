import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProviders } from "@/api/provider";
import { FailedToLoad } from "@/components/FailedToLoad";
import { SelectionItem } from "@/components/SelectionItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type ModelSelectDialogProps = {
  children: React.ReactNode;
  selectedModelId: number | null;
  onCancel?: () => void;
  onConfirm?: (modelId: number | null) => void;
};

function ModelListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`model-skeleton-${Date.now()}-${index}`}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}

export function ModelSelectDialog({
  children,
  selectedModelId,
  onCancel,
  onConfirm,
}: ModelSelectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [tempSelectedModelId, setTempSelectedModelId] = useState<number | null>(
    selectedModelId
  );

  const {
    data: providers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
    enabled: isOpen,
  });

  const handleModelClick = (modelId: number) => {
    if (tempSelectedModelId === modelId) {
      setTempSelectedModelId(null);
    } else {
      setTempSelectedModelId(modelId);
    }
  };

  const handleConfirm = () => {
    onConfirm?.(tempSelectedModelId);
    setIsOpen(false);
  };

  const content = (() => {
    if (isLoading) {
      return <ModelListSkeleton />;
    }

    if (isError) {
      return (
        <FailedToLoad
          refetch={refetch}
          description="无法加载供应商和模型列表，请稍后重试。"
        />
      );
    }

    if (!providers || providers.length === 0) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>暂无供应商</EmptyTitle>
            <EmptyDescription>请先添加 LLM 供应商以使用模型。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <ScrollArea className="max-h-[60vh]">
        {providers.map((provider, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{provider.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.models.map((model) => {
                const isSelected = tempSelectedModelId === model.id;
                return (
                  <SelectionItem
                    key={model.id}
                    value={model.id}
                    label={model.name}
                    isSelected={isSelected}
                    handleToggle={handleModelClick}
                  />
                );
              })}
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    );
  })();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>选择模型</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-muted-foreground text-sm">
          从可用的供应商中选择一个模型：
        </p>

        {content}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
