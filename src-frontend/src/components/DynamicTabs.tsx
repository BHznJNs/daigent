import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type DynamicTabsProps = {
  initialTabs?: TabItem[];
  onAddTab?: () => void;
};

function DynamicTabs({ initialTabs = [], onAddTab }: DynamicTabsProps) {
  const [tabs, setTabs] = useState<TabItem[]>(
    initialTabs.length > 0
      ? initialTabs
      : [{ id: "1", title: "Tab 1", content: <div>Content 1</div> }]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  function handleAddTab() {
    if (onAddTab) {
      onAddTab();
    } else {
      const newId = String(Date.now());
      const newTab: TabItem = {
        id: newId,
        title: `Tab ${tabs.length + 1}`,
        content: <div>Content {tabs.length + 1}</div>,
      };
      setTabs([...tabs, newTab]);
      setSelectedIndex(tabs.length);
    }
  }

  function handleCloseTab(tabId: string, index: number) {
    if (tabs.length === 1) {
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (selectedIndex >= index) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
  }

  return (
    <Tabs
      selectedIndex={selectedIndex}
      onSelect={(index) => setSelectedIndex(index)}
      className="flex h-full flex-col"
    >
      <TabList className="flex items-center gap-1 border-b bg-muted/30 px-2">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            className={cn(
              "group relative flex items-center gap-2 rounded-t-md px-4 py-2 font-medium text-sm outline-none transition-colors hover:bg-background",
              "cursor-pointer select-none",
              selectedIndex === index
                ? "bg-background text-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="truncate">{tab.title}</span>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                className="p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id, index);
                }}
              >
                <XIcon className="size-3" />
              </Button>
            )}
          </Tab>
        ))}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleAddTab}
          className="ml-auto"
        >
          <PlusIcon className="size-4" />
        </Button>
      </TabList>

      {tabs.map((tab) => (
        <TabPanel key={tab.id} className="flex-1 overflow-auto p-4">
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export { DynamicTabs };
export type { TabItem };
