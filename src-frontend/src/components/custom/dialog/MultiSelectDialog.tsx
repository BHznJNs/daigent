import { CheckIcon } from "lucide-react";
import { type Key, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BaseMultiSelectDialogProps<Selection> = {
  children: React.ReactNode;
  values?: Selection[];
  getKey?: (selection: Selection) => Key;
  getValue?: (selection: Selection) => string;
  getLabel?: (selection: Selection) => string;
  onConfirm?: (values: Selection[]) => void;
  onCancel?: () => void;
  placeholder?: string;
  emptyText?: string;
  confirmText?: string;
  cancelText?: string;
};

type MultiSelectDialogProps<Selection> =
  BaseMultiSelectDialogProps<Selection> & {
    selections: Selection[];
  };

export function MultiSelectDialog<Selection>({
  children,
  values = [],
  selections,
  getKey = (selection: Selection) => selection as Key,
  getValue = (selection: Selection) => selection as string,
  getLabel,
  onConfirm,
  onCancel,
  placeholder = "Search...",
  emptyText = "No results found.",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: MultiSelectDialogProps<Selection>) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Selection[]>(values);

  // Reset selected values when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedValues(values);
    }
  }, [open, values]);

  const handleToggle = (selection: Selection) => {
    const selectionValue = getValue(selection);
    const isSelected = selectedValues.some(
      (v) => getValue(v) === selectionValue
    );

    if (isSelected) {
      setSelectedValues(
        selectedValues.filter((v) => getValue(v) !== selectionValue)
      );
    } else {
      setSelectedValues([...selectedValues, selection]);
    }
  };

  const handleConfirm = () => {
    onConfirm?.(selectedValues);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedValues(values);
    onCancel?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-0 bg-popover p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="shadcn-scroll">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {selections.map((selection: Selection) => {
                const key = getKey(selection);
                const value = getValue(selection);
                const label = getLabel?.(selection) ?? value;
                const isSelected = selectedValues.some(
                  (v) => getValue(v) === value
                );
                return (
                  <CommandItem
                    key={key}
                    value={value}
                    onSelect={() => handleToggle(selection)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <DialogFooter className="px-2 py-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button size="sm" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SelectionGroup<Selection> = {
  heading: string;
  items: Selection[];
};

type GroupedMultiSelectDialogProps<Selection> =
  BaseMultiSelectDialogProps<Selection> & {
    groups: SelectionGroup<Selection>[];
  };

export function GroupedMultiSelectDialog<Selection>({
  children,
  values = [],
  groups,
  getKey = (selection: Selection) => selection as Key,
  getValue = (selection: Selection) => selection as string,
  getLabel,
  onConfirm,
  onCancel,
  placeholder = "Search...",
  emptyText = "No results found.",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: GroupedMultiSelectDialogProps<Selection>) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Selection[]>(values);

  // Reset selected values when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedValues(values);
    }
  }, [open, values]);

  const handleToggle = (selection: Selection) => {
    const selectionValue = getValue(selection);
    const isSelected = selectedValues.some(
      (v) => getValue(v) === selectionValue
    );

    if (isSelected) {
      setSelectedValues(
        selectedValues.filter((v) => getValue(v) !== selectionValue)
      );
    } else {
      setSelectedValues([...selectedValues, selection]);
    }
  };

  const handleConfirm = () => {
    onConfirm?.(selectedValues);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedValues(values);
    onCancel?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-0 bg-popover p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="shadcn-scroll">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map((group, groupIndex) => (
              <div key={group.heading}>
                <CommandGroup heading={group.heading}>
                  {group.items.map((item) => {
                    const key = getKey(item);
                    const value = getValue(item);
                    const label = getLabel?.(item) ?? value;
                    const isSelected = selectedValues.some(
                      (v) => getValue(v) === value
                    );
                    return (
                      <CommandItem
                        key={key}
                        value={value}
                        onSelect={() => handleToggle(item)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {groupIndex < groups.length - 1 && <CommandSeparator />}
              </div>
            ))}
          </CommandList>
        </Command>
        <DialogFooter className="px-2 py-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
