import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Tab as ReactTab,
  TabList as ReactTabList,
  TabPanel as ReactTabPanel,
  Tabs as ReactTabs,
} from "react-tabs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Tab, useTabsStore } from "@/stores/tabs-store";

function SortableTab({ tab }: { tab: Tab }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tab.id });
  const { activeTabId, removeTab, setActiveTab } = useTabsStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTabClose = (
    e: React.MouseEvent<SVGSVGElement>,
    tabId: string
  ) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>, tabId: string) => {
    if (e.button === 1) {
      removeTab(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ReactTab
        key={tab.id}
        onMouseDown={(e) => handleMouseDown(e, tab.id)}
        className={cn(
          "group flex min-w-24 shrink-0 cursor-pointer items-center justify-between gap-2 border-r border-b py-2 pr-2 pl-4 text-muted-foreground text-sm outline-0 transition-colors duration-200 ease-in-out",
          "hover:bg-muted/40 hover:text-primary",
          {
            "border-b-transparent bg-muted! text-primary!":
              tab.id === activeTabId,
          }
        )}
      >
        <span>{tab.title}</span>
        <XIcon
          size={14}
          className={cn(
            "rounded-sm opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100",
            { "opacity-100": tab.id === activeTabId }
          )}
          onClick={(e) => handleTabClose(e, tab.id)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </ReactTab>
    </div>
  );
}
SortableTab.tabsRole = "Tab";

export function Tabs() {
  const { tabs, activeTabId, setActiveTab, setTabs } = useTabsStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    const viewport = scrollArea.querySelector(
      "div[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (!viewport) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) {
        return;
      }
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    };

    viewport.addEventListener("wheel", handleWheel);
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [tabs]);

  const handleTabSelect = (index: number) => {
    if (tabs[index]) {
      setActiveTab(tabs[index].id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      const newTabs = arrayMove(tabs, oldIndex, newIndex);
      setTabs(newTabs);
    }
  };

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <ReactTabs
        selectedIndex={activeIndex}
        onSelect={handleTabSelect}
        className="flex h-full flex-col"
        selectedTabPanelClassName="!block"
      >
        <ScrollArea ref={scrollAreaRef}>
          <SortableContext
            items={tabs.map((tab) => tab.id)}
            strategy={rectSortingStrategy}
          >
            <ReactTabList className="shink-0 flex bg-card">
              {tabs.map((tab) => (
                <SortableTab key={tab.id} tab={tab} />
              ))}
            </ReactTabList>
          </SortableContext>
          <ScrollBar className="h-1.5" orientation="horizontal" />
        </ScrollArea>

        <div className="grow overflow-y-auto">
          {(() => {
            if (activeTabId === null) {
              return null;
            }
            if (tabs.length === 0) {
              return (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  <p>No tabs open</p>
                </div>
              );
            }
            return tabs.map((tab) => (
              <ReactTabPanel key={tab.id} className="hidden h-full bg-muted">
                <div className="p-4">{tab.title} Content</div>
              </ReactTabPanel>
            ));
          })()}
        </div>
      </ReactTabs>
    </DndContext>
  );
}
