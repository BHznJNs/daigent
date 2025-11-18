import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAgent, deleteAgent, updateAgent } from "@/api/agent";
import { getModel } from "@/api/llm-model";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeteteDialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_AGENT } from "@/constants/agent";
import type { AgentCreate, AgentRead } from "@/types/agent";
import { ModelSelectDialog } from "../dialogs/ModelSelectDialog";

type AgentEditProps = {
  agent: AgentRead | AgentCreate;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = AgentCreate;

export function AgentEdit({ agent, onSuccess, onCancel }: AgentEditProps) {
  const isEditMode = "id" in agent;
  const modelId = (isEditMode ? agent.model?.id : agent.model_id) ?? null;
  const { data: model } = useQuery({
    queryKey: ["llm_models", modelId],
    queryFn: () => (modelId ? getModel(modelId) : null),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: DEFAULT_AGENT,
  });

  useEffect(() => {
    reset({
      name: agent.name,
      system_prompt: agent.system_prompt,
      model_id: modelId,
    });
  }, [agent, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEditMode && "id" in agent) {
        await updateAgent(agent.id, data);
      } else {
        await createAgent(data);
      }
      toast.success("保存成功");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err && typeof err === "object" && "message" in err
          ? (err.message as string)
          : "保存失败"
      );
    }
  });

  const handleDeleteConfirm = async () => {
    if (!(isEditMode && "id" in agent)) {
      return;
    }

    try {
      await deleteAgent(agent.id);
      toast.success("删除成功");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err && typeof err === "object" && "message" in err
          ? (err.message as string)
          : "删除失败"
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4">
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          rules={{
            required: "名称为必填项",
            minLength: { value: 1, message: "名称不能为空" },
            maxLength: { value: 100, message: "名称最多100字符" },
          }}
          render={({ field }) => (
            <Field data-invalid={!!errors.name}>
              <FieldLabel>名称</FieldLabel>
              <Input {...field} placeholder="请输入 Agent 名称" />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>
          )}
        />

        <Controller
          name="system_prompt"
          control={control}
          rules={{
            required: "系统提示为必填项",
            minLength: { value: 1, message: "系统提示不能为空" },
            maxLength: { value: 1000, message: "系统提示最多1000字符" },
          }}
          render={({ field }) => (
            <Field data-invalid={!!errors.system_prompt}>
              <FieldLabel>系统提示</FieldLabel>
              <Textarea {...field} placeholder="请输入系统提示" />
              <FieldError
                errors={errors.system_prompt ? [errors.system_prompt] : []}
              />
            </Field>
          )}
        />

        <Controller
          name="model_id"
          control={control}
          render={({ field }) => (
            <Field data-invalid={!!errors.model_id}>
              <div className="flex justify-between">
                <FieldLabel>关联模型</FieldLabel>
                <ModelSelectDialog
                  selectedModelId={field.value}
                  onConfirm={field.onChange}
                >
                  <Button variant="outline">
                    {field.value ? model?.name : "选择模型"}
                  </Button>
                </ModelSelectDialog>
              </div>
              <FieldError errors={errors.model_id ? [errors.model_id] : []} />
            </Field>
          )}
        />

        <div className="mt-4 flex justify-end gap-2">
          {isEditMode && (
            <ConfirmDeleteDialog
              description={`确定要删除 Agent "${agent.name}" 吗？此操作无法撤销。`}
              onConfirm={handleDeleteConfirm}
              isDeleting={isSubmitting}
            >
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting}
              >
                删除
              </Button>
            </ConfirmDeleteDialog>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onCancel?.();
            }}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
