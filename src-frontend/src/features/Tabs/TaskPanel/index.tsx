import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { createTask, fetchTaskById } from "@/api/task";
import { useTabsStore } from "@/stores/tabs-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { UserMessage } from "@/types/message";
import type { Tab } from "@/types/tab";
import type { TaskRead } from "@/types/task";
import { ContinueTask } from "./ContinueTask";
import { PromptInput, type PromptInputMessage } from "./PromptInput";
import { TaskConversation } from "./TaskConversation";
import { type TaskRunner, useTaskRunner } from "./use-task-runner";

type TaskPanelProps = {
  tabData: Tab;
};

export function TaskPanel({ tabData }: TaskPanelProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { updateTab } = useTabsStore();
  const [taskData, setTaskData] = useImmer<TaskRead | null>(null);
  const [showContinueTask, setShowContinueTask] = useState(false);
  const taskRunner = useTaskRunner(setTaskData, (_err) => {
    setShowContinueTask(true);
  });

  const queryClient = useQueryClient();
  const { data: taskQueryData, isLoading: taskLoading } = useQuery({
    queryKey: tabData.metadata.isDraft
      ? ["task", "draft"]
      : ["task", tabData.metadata.taskId],
    enabled: !tabData.metadata.isDraft,
    queryFn: () => {
      if (tabData.metadata.isDraft) {
        return null;
      }
      return fetchTaskById(tabData.metadata.taskId);
    },
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (taskRead) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      updateTab({
        ...tabData,
        metadata: {
          isDraft: false,
          taskType: tabData.metadata.taskType,
          taskId: taskRead.id,
        },
      });
      setTaskData(taskRead);
    },
  });

  useEffect(() => {
    if (!taskQueryData) {
      return;
    }
    setTaskData(taskQueryData);
    if (!(tabData.metadata.isDraft || taskRunner.state !== "idle")) {
      const lastMessage = taskQueryData.messages.at(-1);
      if (lastMessage) {
        const isAssistantMessage = lastMessage.role === "assistant";
        const isFinishTaskTool =
          lastMessage.role === "tool" && lastMessage.name === "finish_task";
        if (!(isAssistantMessage || isFinishTaskTool)) {
          setShowContinueTask(true);
        }
      }
    }
  }, [taskQueryData]);

  const handleSubmit = async (message: PromptInputMessage, agentId: number) => {
    if (!currentWorkspace) {
      throw new Error("No current workspace");
    }

    const userMessage: UserMessage = {
      role: "user",
      content: message.text,
    };

    if (tabData.metadata.isDraft) {
      const newTask = await createTaskMutation.mutateAsync({
        title: tabData.title,
        type: tabData.metadata.taskType,
        agent_id: agentId,
        workspace_id: currentWorkspace.id,
        messages: [userMessage],
      });
      taskRunner.continue(newTask.id, null);
    } else {
      taskRunner.continue(tabData.metadata.taskId, userMessage);
    }
  };

  const handleContinueTask = () => {
    if (tabData.metadata.isDraft) {
      return;
    }
    setShowContinueTask(false);
    taskRunner.continue(tabData.metadata.taskId, null);
  };

  const handleCustomToolAction = (
    ...args: Parameters<TaskRunner["handleCustomToolAction"]>
  ) => {
    if (tabData.metadata.isDraft) {
      return;
    }
    taskRunner.handleCustomToolAction(...args);
    const [toolMessageId, _, data] = args;
    taskRunner.answerTool(tabData.metadata.taskId, toolMessageId, data);
  };

  return (
    <div className="flex h-full flex-col p-4 pt-0">
      <TaskConversation
        messages={taskData?.messages ?? null}
        isLoading={taskLoading}
        onCustomToolAction={handleCustomToolAction}
      />
      <Activity mode={showContinueTask ? "visible" : "hidden"}>
        <ContinueTask onContinue={handleContinueTask} />
      </Activity>
      <PromptInput
        taskType={tabData.metadata.taskType}
        taskData={taskData}
        taskState={taskRunner.state}
        onSubmit={handleSubmit}
        onCancel={taskRunner.cancel}
      />
    </div>
  );
}
