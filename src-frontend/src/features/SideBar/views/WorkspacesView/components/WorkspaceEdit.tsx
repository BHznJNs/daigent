import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRead } from "@/types/agent";
import type { WorkspaceCreate, WorkspaceRead } from "@/types/workspace";
import { AgentList } from "./AgentList";

type WorkspaceEditProps = {
  workspace: WorkspaceRead | WorkspaceCreate;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

type FormValues = WorkspaceCreate;

export function WorkspaceEdit({
  workspace,
  onConfirm,
  onCancel,
  onDelete,
}: WorkspaceEditProps) {
  const isEditMode = "id" in workspace;
  const queryClient = useQueryClient();
  const { currentWorkspace, setCurrentWorkspace, syncCurrentWorkspace } =
    useWorkspaceStore();
  const [usableAgents, setUsableAgents] = useState(
    isEditMode ? workspace.usable_agents : []
  );

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
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
  }, [workspace, reset, isEditMode]);

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("创建成功", {
        description: `已成功创建工作区 "${newWorkspace.name}"。`,
      });
      reset();
      onConfirm?.();
    },
    onError: (error: Error) => {
      toast.error("创建失败", {
        description: error.message || "创建工作区时发生错误，请稍后重试。",
      });
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormValues }) =>
      updateWorkspace(id, data),
    onSuccess: async (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("更新成功", {
        description: `已成功更新工作区 "${updatedWorkspace.name}"。`,
      });
      reset();
      onConfirm?.();

      // 如果更新的是当前工作区，同步当前工作区状态
      if (updatedWorkspace.id === currentWorkspace?.id) {
        await syncCurrentWorkspace();
      }
    },
    onError: (error: Error) => {
      toast.error("更新失败", {
        description: error.message || "更新工作区时发生错误，请稍后重试。",
      });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: async (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("删除成功", {
        description: "已成功删除工作区。",
      });
      onDelete?.();

      // 如果删除的是当前工作区，清空当前工作区
      if (deletedId === currentWorkspace?.id) {
        await setCurrentWorkspace(null);
      }
    },
    onError: (error: Error) => {
      toast.error("删除失败", {
        description: error.message || "删除工作区时发生错误，请稍后重试。",
      });
    },
  });

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

  const onSubmit = (data: FormValues) => {
    if (isEditMode) {
      updateWorkspaceMutation.mutate({ id: workspace.id, data });
    } else {
      createWorkspaceMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if ("id" in workspace) {
      deleteWorkspaceMutation.mutate(workspace.id);
    }
  };

  function handleAgentConfirm(selectedAgents: AgentRead[]) {
    setValue(
      "usable_agent_ids",
      selectedAgents.map((a) => a.id)
    );
    setUsableAgents(selectedAgents);
  }

  const isLoading =
    createWorkspaceMutation.isPending ||
    updateWorkspaceMutation.isPending ||
    deleteWorkspaceMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-b p-4">
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
              isDeleting={deleteWorkspaceMutation.isPending}
            >
              <Button type="button" variant="destructive" disabled={isLoading}>
                {deleteWorkspaceMutation.isPending ? "删除中..." : "删除"}
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
            disabled={isLoading}
          >
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {(() => {
              if (isEditMode) {
                return isLoading ? "保存中..." : "保存";
              }
              return isLoading ? "创建中..." : "创建";
            })()}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
