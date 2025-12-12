import { Download, Edit2, Trash2 } from "lucide-react";
import { Activity } from "react";
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
import { ModelEditDialog } from "../dialogs/ModelEditDialog";
import { ModelSelectDialog } from "../dialogs/ModelSelectDialog";

type LlmModel = LlmModelCreate | LlmModelUpdate;

type ModelListProps = {
  models: LlmModel[];
  onChange: (models: LlmModel[]) => void;
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

export function ModelList({ models, onChange, provider }: ModelListProps) {
  const handleModelSelection = (selectedModels: string[]) => {
    const modelsToAdd: LlmModelCreate[] = selectedModels.map((modelId) => ({
      name: modelId,
      context_size: 128_000,
      capability: {
        vision: false,
        reasoning: false,
        tool_use: false,
      },
    }));
    onChange([...models, ...modelsToAdd]);
  };

  const handleDelete = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);
    onChange(newModels);
  };

  const handleEditConfirm = (index: number) => (model: LlmModelBase) => {
    const originalModel = models[index];
    const updatedModels = models.map((m) => {
      const isMatch = m.name === originalModel.name;
      return isMatch ? model : m;
    });
    onChange(updatedModels);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <Label>模型列表</Label>
        <ModelSelectDialog
          provider={provider}
          existingModels={models.map((model) => model.name)}
          onConfirm={handleModelSelection}
        >
          <Button type="button" variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            获取模型
          </Button>
        </ModelSelectDialog>
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
