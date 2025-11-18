import { useQueryClient } from "@tanstack/react-query";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "@/api/workspace";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeteteDialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AgentRead } from "@/types/agent";
import type { WorkspaceCreate, WorkspaceRead } from "@/types/workspace";
import { AgentList } from "./AgentList";

type WorkspaceEditProps = {
  workspace: WorkspaceRead | WorkspaceCreate;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = WorkspaceCreate;

export function WorkspaceEdit({
  workspace,
  onSuccess,
  onCancel,
}: WorkspaceEditProps) {
  const isEditMode = "id" in workspace;
  const queryClient = useQueryClient();
  const [usableAgents, setUsableAgents] = useState(
    isEditMode ? workspace.usable_agents : []
  );

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      directory: "",
      usable_agent_ids: [],
    },
  });

  useEffect(() => {
    if (workspace) {
      const usableAgentsLocal = isEditMode ? workspace.usable_agents : [];
      setUsableAgents(usableAgentsLocal);
      reset({
        name: workspace.name,
        directory: workspace.directory,
        usable_agent_ids: usableAgentsLocal.map((a) => a.id),
      });
    }
  }, [workspace, reset]);

  async function chooseDirectory() {
    try {
      const selected = await open({ directory: true });
      if (typeof selected === "string") {
        setValue("directory", selected);
      }
    } catch (e) {
      console.error(e);
      toast.error("选择目录失败");
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!workspace) {
      return;
    }
    try {
      if (isEditMode) {
        await updateWorkspace(workspace.id, data);
      } else {
        await createWorkspace(data);
      }
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error)?.message ?? "更新失败");
    }
  });

  const handleDeleteConfirm = async () => {
    if (!workspace) {
      return;
    }
    if (!isEditMode) {
      return;
    }
    try {
      await deleteWorkspace(workspace.id);
      toast.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error)?.message ?? "删除失败");
    }
  };

  function handleAgentConfirm(selectedAgents: AgentRead[]) {
    setValue(
      "usable_agent_ids",
      selectedAgents.map((a) => a.id)
    );
    setUsableAgents(selectedAgents);
  }

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
              <Input {...field} placeholder="请输入工作区名称" />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>
          )}
        />

        <Controller
          name="directory"
          control={control}
          rules={{ required: "目录路径为必填项" }}
          render={({ field }) => (
            <Field data-invalid={!!errors.directory}>
              <FieldLabel>目录路径</FieldLabel>
              <div className="flex gap-2">
                <Input
                  {...field}
                  placeholder="请输入目录路径，或点击选择"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={chooseDirectory}
                  variant="outline"
                >
                  选择
                </Button>
              </div>
              <FieldError errors={errors.directory ? [errors.directory] : []} />
            </Field>
          )}
        />

        <AgentList agents={usableAgents} onChange={handleAgentConfirm} />

        <div className="mt-4 flex justify-end gap-2">
          {isEditMode && (
            <ConfirmDeleteDialog
              description={`确定要删除工作区"${workspace?.name ?? ""}"吗？此操作无法撤销。`}
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
