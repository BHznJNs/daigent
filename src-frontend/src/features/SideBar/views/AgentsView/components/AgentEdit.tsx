import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, useEffect } from "react";
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
import type { AgentCreate, AgentRead, AgentUpdate } from "@/types/agent";
import { ModelSelectDialog } from "../dialogs/ModelSelectDialog";

type AgentEditProps = {
  agent: AgentRead | AgentCreate;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = AgentCreate;

export function AgentEdit({ agent, onSuccess, onCancel }: AgentEditProps) {
  const isEditMode = "id" in agent;
  const queryClient = useQueryClient();
  const modelId = (isEditMode ? agent.model?.id : agent.model_id) ?? null;
  const { data: model } = useQuery({
    queryKey: ["llm_models", modelId],
    queryFn: () => (modelId ? getModel(modelId) : null),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: DEFAULT_AGENT,
  });

  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("创建成功", {
        description: `已成功创建 ${newAgent.name} Agent。`,
      });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("创建失败", {
        description: error.message || "创建 Agent 时发生错误，请稍后重试。",
      });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgentUpdate }) =>
      updateAgent(id, data),
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({
        queryKey: ["llm_models", updatedAgent.model?.id],
      });
      toast.success("更新成功", {
        description: `已成功更新 ${updatedAgent.name} Agent。`,
      });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("更新失败", {
        description: error.message || "更新 Agent 时发生错误，请稍后重试。",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("删除成功", {
        description: "已成功删除 Agent。",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("删除失败", {
        description: error.message || "删除 Agent 时发生错误，请稍后重试。",
      });
    },
  });

  const isPending =
    createAgentMutation.isPending ||
    updateAgentMutation.isPending ||
    deleteAgentMutation.isPending;

  useEffect(() => {
    reset({
      name: agent.name,
      system_prompt: agent.system_prompt,
      model_id: modelId,
    });
  }, [agent, reset]);

  const onSubmit = (data: FormValues) => {
    if (isEditMode && "id" in agent) {
      updateAgentMutation.mutate({ id: agent.id, data });
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (isEditMode && "id" in agent) {
      deleteAgentMutation.mutate(agent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
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
          <Activity mode={isEditMode ? "visible" : "hidden"}>
            <ConfirmDeleteDialog
              description={`确定要删除 Agent "${agent.name}" 吗？此操作无法撤销。`}
              onConfirm={handleDeleteConfirm}
              isDeleting={deleteAgentMutation.isPending}
            >
              <Button type="button" variant="destructive" disabled={isPending}>
                {deleteAgentMutation.isPending ? "删除中..." : "删除"}
              </Button>
            </ConfirmDeleteDialog>
          </Activity>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onCancel?.();
            }}
            disabled={isPending}
          >
            取消
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
