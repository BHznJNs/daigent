import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { fetchProviders } from "@/api/provider";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PROVIDER, PROVIDER_TYPE_LABELS } from "@/constants/provider";
import type { ProviderRead, ProviderType } from "@/types/provider";
import { ProviderEdit } from "./components/ProviderEdit";

type ProviderItemProps = {
  provider: ProviderRead;
};

function ProviderItem({ provider }: ProviderItemProps) {
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
        <Item
          variant="outline"
          size="sm"
          className="flex cursor-pointer flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
        >
          <ItemContent>
            <ItemTitle>
              {provider.name}
              <Badge className={PROVIDER_TYPE_COLORS[provider.type]}>
                {PROVIDER_TYPE_LABELS[provider.type]}
              </Badge>
            </ItemTitle>
            <ItemDescription className="space-x-1">
              <span className="text-muted-foreground text-sm">
                {provider.models.length} 个模型
              </span>
            </ItemDescription>
          </ItemContent>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Item>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 border-b px-4 py-2 pb-4">
        <ProviderEdit
          provider={provider}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
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
    refetch,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  const content = (() => {
    if (isLoading) {
      return <ProviderListSkeleton />;
    }
    if (error) {
      return (
        <FailedToLoad
          refetch={() => refetch()}
          description="无法加载服务提供商列表，请稍后重试。"
        />
      );
    }
    if (providers.length === 0 && !showAddForm) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>暂无模型服务</EmptyTitle>
            <EmptyDescription>还没有配置任何服务提供商。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }
    return (
      <div className="flex-1 space-y-2">
        {providers.map((provider) => (
          <ProviderItem key={provider.id} provider={provider} />
        ))}
      </div>
    );
  })();

  return (
    <div className="flex flex-col">
      {content}

      <div>
        {showAddForm ? (
          <div className="p-4">
            <h3 className="mb-3 font-medium text-sm">添加服务提供商</h3>
            <ProviderEdit
              provider={DEFAULT_PROVIDER}
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        ) : (
          <div className="w-full p-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <PlusIcon className="h-4 w-4" />
              添加
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
