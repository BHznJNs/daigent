import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Item, ItemActions, ItemContent, ItemTitle } from "./ui/item";

type SelectionValue = string | number;
type SelectionItemProps<V extends SelectionValue> = {
  className?: string;
  value: V;
  label: string;
  isSelected: boolean;
  handleToggle: (value: V) => void;
};

export function SelectionItem<V extends SelectionValue>({
  value,
  className,
  label,
  isSelected,
  handleToggle,
}: SelectionItemProps<V>) {
  return (
    <Item
      variant="outline"
      key={value}
      className={cn("cursor-pointer", className)}
      onClick={() => handleToggle(value)}
    >
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleToggle(value)}
        />
      </ItemActions>
    </Item>
  );
}
