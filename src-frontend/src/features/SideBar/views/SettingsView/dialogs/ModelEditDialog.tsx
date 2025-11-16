import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LlmModelBase } from "@/types/provider";

type ModelEditDialogProps = {
  model: LlmModelBase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (model: LlmModelBase) => void;
};

export function ModelEditDialog({
  model,
  isOpen,
  onClose,
  onConfirm,
}: ModelEditDialogProps) {
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LlmModelBase>();

  useEffect(() => {
    if (isOpen && model) {
      reset(model);
    }
  }, [model, open]);

  const handleSubmitForm = (data: LlmModelBase) => {
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
          <DialogTitle>{"编辑模型信息"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmit(handleSubmitForm)(e);
          }}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              rules={{
                required: "请输入模型名称",
                minLength: {
                  value: 1,
                  message: "模型名称不能为空",
                },
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="model-name">模型名称</FieldLabel>
                  <Input
                    {...field}
                    id="model-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="请输入模型名称"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="context_size"
              control={control}
              rules={{
                required: "请输入上下文大小",
                min: {
                  value: 1,
                  message: "上下文大小必须大于 0",
                },
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="context-size">上下文大小</FieldLabel>
                  <Input
                    {...field}
                    id="context-size"
                    type="number"
                    aria-invalid={fieldState.invalid}
                    placeholder="128000"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel>模型能力</FieldLabel>
              <div className="flex flex-col gap-3">
                <Controller
                  name="capability.vision"
                  control={control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="vision"
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                      <FieldLabel htmlFor="vision" className="font-normal">
                        视觉能力
                      </FieldLabel>
                    </Field>
                  )}
                />
                <Controller
                  name="capability.reasoning"
                  control={control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="reasoning"
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                      <FieldLabel htmlFor="reasoning" className="font-normal">
                        推理能力
                      </FieldLabel>
                    </Field>
                  )}
                />
                <Controller
                  name="capability.tool_use"
                  control={control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="tool_use"
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                      <FieldLabel htmlFor="tool_use" className="font-normal">
                        工具调用
                      </FieldLabel>
                    </Field>
                  )}
                />
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
