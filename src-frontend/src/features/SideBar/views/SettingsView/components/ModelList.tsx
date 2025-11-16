import { Download, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
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
};

function ModelItem({ model, index, onEdit, onDelete }: ModelItemProps) {
  const capabilityBadges = (() => (
    <div className="space-x-1">
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
    </div>
  ))();

  return (
    <Item variant="outline" className="py-2">
      <ItemContent>
        <span className="font-medium">{model.name}</span>
      </ItemContent>
      <ItemDescription>{capabilityBadges}</ItemDescription>
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
    // <Card key={`${model.name}-${index}`} className="px-4 py-2">
    //   <div className="flex items-center justify-between">
    //     <div className="flex-1">
    //       <div className="mb-1 flex items-center gap-2">
    //         <span className="font-medium text-sm">{model.name}</span>
    //       </div>
    //       <div className="flex gap-1">{capabilityBadges}</div>
    //     </div>
    //     <div className="flex gap-1">
    //       <Button
    //         type="button"
    //         variant="ghost"
    //         size="sm"
    //         onClick={() => onEdit(index)}
    //       >
    //         <Edit2 className="h-4 w-4" />
    //       </Button>
    //       <Button
    //         type="button"
    //         variant="ghost"
    //         size="sm"
    //         onClick={() => onDelete(index)}
    //       >
    //         <Trash2 className="h-4 w-4" />
    //       </Button>
    //     </div>
    //   </div>
    // </Card>
  );
}

export function ModelList({ models, onChange, provider }: ModelListProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<LlmModel | undefined>();

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
    if (!editingModel) {
      setShowEditDialog(false);
      return;
    }

    const updatedModels = models.map((m) =>
      m.name === editingModel.name ? model : m
    );
    onChange(updatedModels);
    setShowEditDialog(false);
    setEditingModel(undefined);
  };

  const handleEditClose = () => {
    setShowEditDialog(false);
    setEditingModel(undefined);
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

      <ModelSelectorDialog
        provider={provider}
        isOpen={showModelSelector}
        existingModels={models.map((model) => model.name)}
        onClose={() => setShowModelSelector(false)}
        onConfirm={handleModelSelection}
      />

      {editingModel && (
        <ModelEditDialog
          model={editingModel}
          isOpen={showEditDialog}
          onClose={handleEditClose}
          onConfirm={handleEditConfirm}
        />
      )}
    </>
  );
}
