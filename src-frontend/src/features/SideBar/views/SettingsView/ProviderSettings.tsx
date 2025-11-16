import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { fetchProviders } from "@/api/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { PROVIDER_TYPE_LABELS } from "@/constants/provider";
import type { Provider, ProviderType } from "@/types/provider";
import { ProviderEdit } from "./components/ProviderEdit";

type ProviderCardProps = {
  provider: Provider;
};

function ProviderCard({ provider }: ProviderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const PROVIDER_TYPE_COLORS: Record<ProviderType, string> = {
    openai: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    anthropic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    gemini:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{provider.name}</h3>
            <Badge className={PROVIDER_TYPE_COLORS[provider.type]}>
              {PROVIDER_TYPE_LABELS[provider.type]}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {provider.models.length} 个模型
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <Card>
          <CardContent>
            <ProviderEdit
              provider={provider}
              mode="edit"
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProviderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`provider-skeleton-loading-${Date.now()}-${index}`}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProviderSettings() {
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    data: providers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  let content: React.ReactNode | null = null;

  if (isLoading) {
    content = <ProviderListSkeleton />;
  }

  if (error) {
    content = (
      <Empty>
        <EmptyContent>
          <EmptyTitle>加载失败</EmptyTitle>
          <EmptyDescription>
            无法加载服务提供商列表，请稍后重试。
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  if (providers.length === 0 && !showAddForm) {
    content = (
      <Empty>
        <EmptyContent>
          <EmptyTitle>暂无模型服务</EmptyTitle>
          <EmptyDescription>还没有配置任何服务提供商。</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col py-2">
      {content ?? (
        <div className="flex-1 space-y-2">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      <div className="mt-4">
        {showAddForm ? (
          <Card>
            <CardContent>
              <h3 className="mb-3 font-medium text-sm">添加服务提供商</h3>
              <ProviderEdit
                mode="create"
                onSuccess={() => setShowAddForm(false)}
                onCancel={() => setShowAddForm(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <PlusIcon className="h-4 w-4" />
            添加
          </Button>
        )}
      </div>
    </div>
  );
}
