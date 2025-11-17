import { Download, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
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
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
};

function ModelItem({ model, index, onEdit, onDelete }: ModelItemProps) {
  const capabilityBadges = (() => (
    <span className="space-x-1">
      {model.capability.vision && (
        <Badge key="vision" variant="secondary">
          视觉
        </Badge>
      )}
      {model.capability.reasoning && (
        <Badge key="reasoning" variant="secondary">
          推理
        </Badge>
      )}
      {model.capability.tool_use && (
        <Badge key="tool_use" variant="secondary">
          工具使用
        </Badge>
      )}
    </span>
  ))();

  return (
    <Item variant="outline" className="py-2">
      <ItemContent>
        <ItemTitle>{model.name}</ItemTitle>
        <ItemDescription>{capabilityBadges}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(index)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
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
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<LlmModel | null>(null);

  const handleFetchModelList = () => {
    setShowModelSelector(true);
  };

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
    setShowModelSelector(false);
  };

  const handleEdit = (index: number) => {
    const model = models[index];
    setEditingModel(model);
    setShowEditDialog(true);
  };

  const handleDelete = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);
    onChange(newModels);
  };

  const handleEditConfirm = (model: LlmModelBase) => {
    if (!editingModel) {
      setShowEditDialog(false);
      return;
    }

    const updatedModels = models.map((m) => {
      const isMatch = m.name === editingModel.name;
      return isMatch ? model : m;
    });
    onChange(updatedModels);
    setShowEditDialog(false);
    setEditingModel(null);
  };

  const handleEditClose = () => {
    setShowEditDialog(false);
    setEditingModel(null);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Label>模型列表</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFetchModelList}
          >
            <Download className="mr-1 h-4 w-4" />
            获取模型
          </Button>
        </div>
        <div className="space-y-2">
          {models.map((model, index) => (
            <ModelItem
              key={`${model.name}-${index}`}
              model={model}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <ModelSelectDialog
        provider={provider}
        isOpen={showModelSelector}
        existingModels={models.map((model) => model.name)}
        onClose={() => setShowModelSelector(false)}
        onConfirm={handleModelSelection}
      />

      <ModelEditDialog
        model={editingModel}
        isOpen={showEditDialog}
        onClose={handleEditClose}
        onConfirm={handleEditConfirm}
      />
    </>
  );
}
