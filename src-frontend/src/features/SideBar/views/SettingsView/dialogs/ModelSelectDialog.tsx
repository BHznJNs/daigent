import { useQuery } from "@tanstack/react-query";
import { fetchProviderModels } from "@/api/llm";
import { MultiSelectDialog } from "@/components/custom/dialog/MultiSelectDialog";
import type { ProviderBase } from "@/types/provider";

type ModelSelectDialogProps = {
  children: React.ReactNode;
  provider: ProviderBase;
  existingModels: string[];
  onCancel?: () => void;
  onConfirm?: (selectedModels: string[]) => void;
};

export function ModelSelectDialog({
  children,
  provider,
  existingModels: existingModelArr,
  onCancel,
  onConfirm,
}: ModelSelectDialogProps) {
  const { data: availableModels, isLoading } = useQuery({
    queryKey: ["provider-models", provider.name, provider.base_url],
    queryFn: () =>
      fetchProviderModels(provider.type, provider.base_url, provider.api_key),
  });
  return (
    <MultiSelectDialog
      values={existingModelArr}
      selections={availableModels ?? []}
      onConfirm={onConfirm}
      onCancel={onCancel}
      placeholder="搜索模型..."
      emptyText={isLoading ? "加载中..." : "未找到模型"}
    >
      {children}
    </MultiSelectDialog>
  );
}
