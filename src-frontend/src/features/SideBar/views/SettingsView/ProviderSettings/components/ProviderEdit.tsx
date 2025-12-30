import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createProvider, deleteProvider, updateProvider } from "@/api/provider";
import { ConfirmDeleteDialog } from "@/components/custom/dialog/ConfirmDeteteDialog";
import { PasswordInput } from "@/components/Password";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROVIDER_DEFAULT_URLS,
  PROVIDER_TYPE_LABELS,
} from "@/constants/provider";
import type {
  LlmProviders,
  ProviderCreate,
  ProviderRead,
  ProviderUpdate,
} from "@/types/provider";
import { ModelList } from "./ModelList";

const URL_REGEX = /^(https?:\/\/)([^\s/$.?#].[^\s]*)$/;

type ProviderEditProps = {
  provider: ProviderRead | ProviderCreate;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ProviderEdit({
  provider,
  onSuccess,
  onCancel,
}: ProviderEditProps) {
  const isEditMode = "id" in provider;
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
    control,
  } = useForm<ProviderCreate>();

  useEffect(() => {
    reset({
      name: provider.name,
      type: provider.type,
      base_url: provider.base_url,
      api_key: provider.api_key,
      models: [...provider.models],
    });
  }, [provider]);

  const formValues = useWatch({ control });

  const createProviderMutation = useMutation({
    mutationFn: createProvider,
    onSuccess: (newProvider) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("创建成功", {
        description: `已成功创建 ${newProvider.name} 服务提供商。`,
      });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("创建失败", {
        description: error.message || "创建 provider 时发生错误，请稍后重试。",
      });
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProviderUpdate }) =>
      updateProvider(id, data),
    onSuccess: (updatedProvider) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("更新成功", {
        description: `已成功更新 ${updatedProvider.name} 服务提供商。`,
      });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("更新失败", {
        description: error.message || "更新 provider 时发生错误，请稍后重试。",
      });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("删除成功", {
        description: "已成功删除服务提供商。",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("删除失败", {
        description: error.message || "删除 provider 时发生错误，请稍后重试。",
      });
    },
  });

  const onSubmit = (data: ProviderCreate | ProviderUpdate) => {
    if (isEditMode) {
      updateProviderMutation.mutate({
        id: provider.id,
        data,
      });
    } else {
      createProviderMutation.mutate(data);
    }
  };

  const handleTypeChange = (value: LlmProviders) => {
    if (!(value in PROVIDER_DEFAULT_URLS)) {
      return;
    }
    setValue("type", value);
    const shouldUpdateBaseUrl =
      formValues.base_url === undefined ||
      formValues.base_url === "" ||
      (formValues.type &&
        formValues.base_url === PROVIDER_DEFAULT_URLS[formValues.type]);
    if (shouldUpdateBaseUrl) {
      setValue("base_url", PROVIDER_DEFAULT_URLS[value]);
    }
  };

  const handleConfirmDelete = () => {
    if ("id" in provider) {
      deleteProviderMutation.mutate(provider.id);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          rules={{
            required: "请输入提供商名称",
            minLength: {
              value: 1,
              message: "名称不能为空",
            },
            maxLength: {
              value: 50,
              message: "名称长度不能超过 50 个字符",
            },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="provider-name">名称</FieldLabel>
              <Input
                {...field}
                id="provider-name"
                aria-invalid={fieldState.invalid}
                placeholder="提供商名称"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={control}
          rules={{ required: "请选择提供商类型" }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="provider-type">类型</FieldLabel>
              <Select value={field.value} onValueChange={handleTypeChange}>
                <SelectTrigger
                  id="provider-type"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="选择提供商类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="base_url"
          control={control}
          rules={{
            required: "请输入 API 基础地址",
            pattern: {
              value: URL_REGEX,
              message: "请输入有效的 HTTP 或 HTTPS URL",
            },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="provider-base-url">API 基础地址</FieldLabel>
              <Input
                {...field}
                id="provider-base-url"
                type="url"
                aria-invalid={fieldState.invalid}
                placeholder="https://api.example.com/v1"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="api_key"
          control={control}
          rules={{
            required: "请输入 API 密钥",
            minLength: {
              value: 1,
              message: "API 密钥不能为空",
            },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="provider-api-key">API 密钥</FieldLabel>
              <PasswordInput
                {...field}
                id="provider-api-key"
                aria-invalid={fieldState.invalid}
                placeholder="输入 API 密钥"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="models"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ModelList
              models={field.value || []}
              onConfirm={field.onChange}
              provider={formValues as ProviderRead | ProviderCreate}
            />
          )}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Activity mode={isEditMode ? "visible" : "hidden"}>
            <ConfirmDeleteDialog
              description={`您确定要删除服务提供商 "${provider.name}" 吗？此操作无法撤销。`}
              onConfirm={handleConfirmDelete}
              isDeleting={deleteProviderMutation.isPending}
            >
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting || deleteProviderMutation.isPending}
              >
                {deleteProviderMutation.isPending ? "删除中..." : "删除"}
              </Button>
            </ConfirmDeleteDialog>
          </Activity>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {(() => {
              if (isEditMode) {
                return isSubmitting ? "保存中..." : "保存";
              }
              return isSubmitting ? "创建中..." : "创建";
            })()}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
