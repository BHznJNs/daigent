import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Activity, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import { DEFAULT_WORKSPACE } from "@/constants/workspace";
import { SideBarHeader } from "../../SideBar";
import { WorkspaceEdit } from "./components/WorkspaceEdit";
import { WorkspaceList } from "./components/WorkspaceList";
import { WorkspaceListSkeleton } from "./components/WorkspaceListSkeleton";

export function WorkspacesView() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateWorkspace = () => {
    setShowCreateForm(true);
  };

  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Workspaces"
        actions={[
          {
            button: (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCreateWorkspace}
              >
                <PlusIcon className="size-4" />
              </Button>
            ),
            tooltip: "Create new workspace",
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
                  description="无法加载工作区列表，请稍后重试。"
                />
              )}
            >
              <Suspense fallback={<WorkspaceListSkeleton />}>
                <WorkspaceList />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <Activity mode={showCreateForm ? "visible" : "hidden"}>
          <WorkspaceEdit
            workspace={DEFAULT_WORKSPACE}
            onConfirm={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </Activity>
      </div>
    </div>
  );
}
WorkspacesView.componentId = "workspaces";
