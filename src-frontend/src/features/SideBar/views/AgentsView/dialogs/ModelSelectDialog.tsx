import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchProviders } from "@/api/provider";
import { GroupedSingleSelectDialog } from "@/components/custom/dialog/SingleSelectDialog";
import type { LlmModelRead } from "@/types/provider";

type ModelSelectDialogProps = {
  children: React.ReactNode;
  selectedModelId: number | null;
  onSelect?: (modelId: number | null) => void;
};

export function ModelSelectDialog({
  children,
  selectedModelId,
  onSelect,
}: ModelSelectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: providers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
    enabled: isOpen,
  });

  const groups = useMemo(() => {
    if (!providers) {
      return [];
    }
    return providers.map((provider) => ({
      heading: provider.name,
      items: provider.models,
    }));
  }, [providers]);

  const selectedModel = useMemo(() => {
    if (!providers || selectedModelId === null) {
      return null;
    }
    for (const provider of providers) {
      const model = provider.models.find((m) => m.id === selectedModelId);
      if (model) {
        return model;
      }
    }
    return null;
  }, [providers, selectedModelId]);

  const handleSelect = (model: LlmModelRead) => {
    // 如果选择的是已选中的模型，则取消选择
    if (model.id === selectedModelId) {
      onSelect?.(null);
    } else {
      onSelect?.(model.id);
    }
    setIsOpen(false);
  };

  const emptyText = (() => {
    if (isLoading) {
      return "加载中...";
    }
    if (isError) {
      return "无法加载供应商和模型列表，请稍后重试。";
    }
    if (!providers || providers.length === 0) {
      return "暂无供应商，请先添加 LLM 供应商以使用模型。";
    }
    return "未找到模型";
  })();

  return (
    <GroupedSingleSelectDialog
      value={selectedModel ?? undefined}
      groups={groups}
      getKey={(model) => model.id}
      getValue={(model) => model.name}
      onSelect={handleSelect}
      placeholder="搜索模型..."
      emptyText={emptyText}
    >
      {children}
    </GroupedSingleSelectDialog>
  );
}
