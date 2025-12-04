import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRead } from "@/types/agent";

type AgentSelectorProps = {
  value: AgentRead | null;
  onValueChange: (agent: AgentRead | null) => void;
};

export function AgentSelector({ value, onValueChange }: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const { currentWorkspace, isLoading } = useWorkspaceStore();

  const agents = currentWorkspace?.usable_agents ?? [];
  function handleSelect(agent: AgentRead) {
    onValueChange(agent.id === value?.id ? null : agent);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value ? value.name : "Select agent"}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <Command>
          <CommandInput placeholder="Search agent..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No agent found."}
            </CommandEmpty>
            <CommandGroup>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.name}
                  onSelect={() => handleSelect(agent)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value?.id === agent.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {agent.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
