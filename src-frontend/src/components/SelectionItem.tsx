import { Checkbox } from "./ui/checkbox";
import { Item, ItemActions, ItemContent } from "./ui/item";

type SelectionValue = string | number;
type SelectionItemProps<V extends SelectionValue> = {
  value: V;
  label: string;
  isSelected: boolean;
  handleToggle: (value: V) => void;
};

export function SelectionItem<V extends SelectionValue>({
  value,
  label,
  isSelected,
  handleToggle,
}: SelectionItemProps<V>) {
  return (
    <Item variant="outline" key={value}>
      <ItemContent>
        <span className="font-medium">{label}</span>
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
