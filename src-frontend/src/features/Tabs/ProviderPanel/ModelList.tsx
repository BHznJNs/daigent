import { useQuery } from "@tanstack/react-query";
import { Download, Edit2, Trash2 } from "lucide-react";
import { Activity } from "react";
import { fetchProviderModels } from "@/api/llm";
import { MultiSelectDialog } from "@/components/custom/dialog/MultiSelectDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import type {
  LlmModelBase,
  LlmModelCreate,
  LlmModelUpdate,
  ProviderCreate,
  ProviderRead,
} from "@/types/provider";
import { ModelEditDialog } from "./ModelEditDialog";

type LlmModel = LlmModelCreate | LlmModelUpdate;

type ModelListProps = {
  models: LlmModel[];
  onConfirm: (models: LlmModel[]) => void;
  provider: ProviderRead | ProviderCreate;
};

type ModelItemProps = {
  model: LlmModel;
  index: number;
  onDelete: (index: number) => void;
  onEditConfirm: (index: number) => (model: LlmModelBase) => void;
};

function ModelItem({ model, index, onDelete, onEditConfirm }: ModelItemProps) {
  const capabilityBadges = (() => (
    <span className="space-x-1">
      <Activity mode={model.capability.vision ? "visible" : "hidden"}>
        <Badge key="vision" variant="secondary">
          视觉
        </Badge>
      </Activity>
      <Activity mode={model.capability.reasoning ? "visible" : "hidden"}>
        <Badge key="reasoning" variant="secondary">
          推理
        </Badge>
      </Activity>
      <Activity mode={model.capability.tool_use ? "visible" : "hidden"}>
        <Badge key="tool_use" variant="secondary">
          工具使用
        </Badge>
      </Activity>
    </span>
  ))();

  return (
    <Item variant="outline" className="py-2">
      <ItemContent>
        <ItemTitle>{model.name}</ItemTitle>
        <ItemDescription>{capabilityBadges}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ModelEditDialog model={model} onConfirm={onEditConfirm(index)}>
          <Button type="button" variant="ghost" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
        </ModelEditDialog>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}

export function ModelList({ models, onConfirm, provider }: ModelListProps) {
  const { data: availableModels, isLoading } = useQuery({
    queryKey: [
      "provider-models",
      provider.name,
      provider.base_url,
      provider.api_key,
    ],
    queryFn: () =>
      fetchProviderModels(provider.type, provider.base_url, provider.api_key),
  });

  const existingModels = models.map((model) => model.name);

  const handleConfirm = (selectedModelIds: string[]) => {
    const selectedModelIdSet = new Set(selectedModelIds);
    const result: LlmModel[] = [];
    // merge selected models with the existing models
    for (const model of models) {
      if (selectedModelIdSet.has(model.name)) {
        result.push(model);
      }
      selectedModelIdSet.delete(model.name);
    }
    for (const model of selectedModelIdSet) {
      result.push({
        name: model,
        context_size: 128_000,
        capability: {
          vision: false,
          reasoning: false,
          tool_use: false,
        },
      });
    }
    onConfirm(result);
  };

  const handleDelete = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);
    onConfirm(newModels);
  };

  const handleEditConfirm = (index: number) => (model: LlmModelBase) => {
    const originalModel = models[index];
    const updatedModels = models.map((m) => {
      const isMatch = m.name === originalModel.name;
      return isMatch ? model : m;
    });
    onConfirm(updatedModels);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <Label>模型列表</Label>
        <MultiSelectDialog
          values={existingModels}
          selections={availableModels ?? []}
          onConfirm={handleConfirm}
          placeholder="搜索模型..."
          emptyText={isLoading ? "加载中..." : "未找到模型"}
        >
          <Button type="button" variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            获取模型
          </Button>
        </MultiSelectDialog>
      </div>
      <div className="space-y-2">
        {models.map((model, index) => (
          <ModelItem
            key={`${model.name}-${index}`}
            model={model}
            index={index}
            onDelete={handleDelete}
            onEditConfirm={handleEditConfirm}
          />
        ))}
      </div>
    </div>
  );
}
