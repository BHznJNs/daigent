import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Activity, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import { DEFAULT_AGENT } from "@/constants/agent";
import { SideBarHeader } from "../../SideBar";
import { AgentEdit } from "./components/AgentEdit";
import { AgentList } from "./components/AgentList";
import { AgentListSkeleton } from "./components/AgentListSkeleton";

export function AgentsView() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateAgent = () => {
    setShowCreateForm(true);
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
        <Activity mode={showCreateForm ? "visible" : "hidden"}>
          <AgentEdit
            agent={DEFAULT_AGENT}
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </Activity>
      </div>
    </div>
  );
}
AgentsView.componentId = "agents";
