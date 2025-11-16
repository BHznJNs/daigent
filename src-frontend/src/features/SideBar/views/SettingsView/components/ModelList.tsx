import { Download, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { SettingItem } from "@/components/SettingItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LlmModel, Provider } from "@/types/provider";
import { ModelEditDialog } from "../dialogs/ModelEditDialog";
import { ModelSelectorDialog } from "../dialogs/ModelSelectorDialog";

type ModelListProps = {
  models: LlmModel[];
  onChange: (models: LlmModel[]) => void;
  provider: Provider;
};

type ModelItemProps = {
  model: LlmModel;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  getCapabilityBadges: (model: LlmModel) => JSX.Element[];
};

function ModelItem({
  model,
  index,
  onEdit,
  onDelete,
  getCapabilityBadges,
}: ModelItemProps) {
  return (
    <Card key={`${model.name}-${index}`} className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-medium">{model.name}</span>
          </div>
          <div className="flex gap-1">{getCapabilityBadges(model)}</div>
        </div>
        <div className="flex gap-1">
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
        </div>
      </div>
    </Card>
  );
}

export function ModelList({ models, onChange, provider }: ModelListProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<LlmModel | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFetchModelList = () => {
    setShowModelSelector(true);
  };

  const handleModelSelection = (selectedModels: string[]) => {
    const modelsToAdd: LlmModel[] = selectedModels.map((modelId) => ({
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

  const handleEditConfirm = (model: LlmModel) => {
    setIsSubmitting(true);
    try {
      if (editingModel) {
        // 编辑现有模型
        const updatedModels = models.map((m) =>
          m.name === editingModel.name ? model : m
        );
        onChange(updatedModels);
      } else {
        // 添加新模型
        onChange([...models, model]);
      }
      setShowEditDialog(false);
      setEditingModel(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClose = () => {
    setShowEditDialog(false);
    setEditingModel(undefined);
  };

  const getCapabilityBadges = (model: LlmModel): JSX.Element[] => {
    const badges: JSX.Element[] = [];
    if (model.capability.vision) {
      badges.push(
        <Badge key="vision" variant="secondary">
          视觉
        </Badge>
      );
    }
    if (model.capability.reasoning) {
      badges.push(
        <Badge key="reasoning" variant="secondary">
          推理
        </Badge>
      );
    }
    if (model.capability.tool_use) {
      badges.push(
        <Badge key="tool_use" variant="secondary">
          工具使用
        </Badge>
      );
    }
    return badges;
  };

  return (
    <>
      <div className="space-y-4">
        <SettingItem title="模型列表">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFetchModelList}
          >
            <Download className="mr-1 h-4 w-4" />
            获取模型
          </Button>
        </SettingItem>

        <div className="space-y-2">
          {models.map((model, index) => (
            <ModelItem
              key={`${model.name}-${index}`}
              model={model}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getCapabilityBadges={getCapabilityBadges}
            />
          ))}
        </div>
      </div>

      <ModelSelectorDialog
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
        isSubmitting={isSubmitting}
      />
    </>
  );
}
