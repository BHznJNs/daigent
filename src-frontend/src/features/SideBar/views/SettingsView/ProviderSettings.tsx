import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROVIDER } from "@/constants/provider";
import { ProviderEdit } from "./components/ProviderEdit";
import { ProviderList } from "./components/ProviderList";
import { ProviderListSkeleton } from "./components/ProviderListSkeleton";

export function ProviderSettings() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="flex flex-col">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <FailedToLoad
                refetch={resetErrorBoundary}
                description="无法加载服务提供商列表，请稍后重试。"
              />
            )}
          >
            <Suspense fallback={<ProviderListSkeleton />}>
              <ProviderList showAddForm={showAddForm} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>

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
