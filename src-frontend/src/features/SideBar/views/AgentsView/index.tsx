import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import type { Tab } from "@/types/tab";
import { SideBarHeader } from "../../SideBar";
import { AgentList } from "./AgentList";
import { AgentListSkeleton } from "./AgentListSkeleton";

function createAgentCreateTab(): Tab {
  return {
    id: tabIdFactory(),
    type: "agent",
    title: "创建 Agent",
    icon: "bot",
    metadata: { mode: "create" },
  };
}

export function AgentsView() {
  const { addTab } = useTabsStore();

  const handleCreateAgent = () => {
    const newTab = createAgentCreateTab();
    addTab(newTab);
  };

  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Agents"
        actions={[
          {
            button: (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCreateAgent}
              >
                <PlusIcon className="size-4" />
              </Button>
            ),
            tooltip: "Create new agent",
          },
        ]}
      />
      <div className="flex-1">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <FailedToLoad
                  refetch={resetErrorBoundary}
                  description="无法加载 Agent 列表，请稍后重试。"
                />
              )}
            >
              <Suspense fallback={<AgentListSkeleton />}>
                <AgentList />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </div>
  );
}
AgentsView.componentId = "agents";
