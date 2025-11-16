import { useForm } from "react-hook-form";
import { SettingItem } from "@/components/SettingItem";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LlmModel } from "@/types/provider";

type ModelEditDialogProps = {
  model?: LlmModel;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (model: LlmModel) => void;
  isSubmitting?: boolean;
};

const DEFAULT_MODEL_CAPABILITY = {
  vision: false,
  reasoning: false,
  tool_use: false,
};

export function ModelEditDialog({
  model,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ModelEditDialogProps) {
  const isEditing = !!model;

  // 计算按钮文本
  let buttonText = "添加";
  if (isSubmitting) {
    buttonText = "保存中...";
  } else if (isEditing) {
    buttonText = "保存";
  }

  const {
    register,
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LlmModel>({
    defaultValues: model || {
      name: "",
      context_size: 128_000,
      capability: DEFAULT_MODEL_CAPABILITY,
    },
  });

  const handleSubmitForm = (data: LlmModel) => {
    onConfirm(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑模型" : "添加模型"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <SettingItem title="模型名称">
            <Input
              id="model-name"
              {...register("name", {
                required: "请输入模型名称",
                minLength: {
                  value: 1,
                  message: "模型名称不能为空",
                },
              })}
              placeholder="请输入模型名称"
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </SettingItem>

          <SettingItem title="上下文大小">
            <Input
              id="context-size"
              type="number"
              placeholder="128000"
              {...register("context_size", {
                required: "请输入上下文大小",
                min: {
                  value: 1,
                  message: "上下文大小必须大于 0",
                },
              })}
            />
            {errors.context_size && (
              <p className="text-destructive text-sm">
                {errors.context_size.message}
              </p>
            )}
          </SettingItem>

          <SettingItem title="模型能力" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vision"
                  checked={watch("capability.vision") as boolean}
                  onCheckedChange={(checked: boolean) =>
                    setValue("capability.vision", checked)
                  }
                />
                <Label htmlFor="vision" className="text-sm">
                  视觉能力
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reasoning"
                  checked={watch("capability.reasoning") as boolean}
                  onCheckedChange={(checked: boolean) =>
                    setValue("capability.reasoning", checked)
                  }
                />
                <Label htmlFor="reasoning" className="text-sm">
                  推理能力
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tool_use"
                  checked={watch("capability.tool_use") as boolean}
                  onCheckedChange={(checked: boolean) =>
                    setValue("capability.tool_use", checked)
                  }
                />
                <Label htmlFor="tool_use" className="text-sm">
                  工具调用
                </Label>
              </div>
            </div>
          </SettingItem>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
