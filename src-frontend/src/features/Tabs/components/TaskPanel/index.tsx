import type { Tab } from "@/types/tab";
import { PromptInput, type PromptInputMessage } from "./PromptInput";

type TaskPanelProps = {
  tabData: Tab;
};

export function TaskPanel({ tabData }: TaskPanelProps) {
  const handleSubmit = (message: PromptInputMessage, agentId: number) => {
    if (tabData.metadata.isDraft) {
      // TODO: create task
      return;
    }
    // TODO: append message
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-1">Task Panel</div>
      <PromptInput taskType={tabData.metadata.type} onSubmit={handleSubmit} />
    </div>
  );
}
