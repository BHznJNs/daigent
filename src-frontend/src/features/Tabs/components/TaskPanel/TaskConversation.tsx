import { Activity } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { Message as ConversationMessage } from "@/types/message";

type TaskConversationProps = {
  messages: ConversationMessage[] | null;
  isLoading: boolean;
};

export function TaskConversation({
  messages,
  isLoading,
}: TaskConversationProps) {
  return (
    <Conversation>
      <ConversationContent>
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <ConversationEmptyState />
        </Activity>
        <Activity mode={isLoading ? "hidden" : "visible"}>
          {messages?.map((message, index) => {
            if (message.role === "system") {
              return null;
            }
            if (message.role === "tool") {
              // TODO: render tool messages
              return null;
            }
            return (
              <Message key={index} from={message.role}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <MessageResponse>
                      {message.content as string}
                    </MessageResponse>
                  ) : (
                    (message.content as string)
                  )}
                </MessageContent>
              </Message>
            );
          })}
        </Activity>
        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}
