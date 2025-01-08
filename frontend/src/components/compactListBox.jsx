import React from "react";
import { Maximize2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";


function CompactListBox({
  title,
  emptyText = "No items available",
  data = {},
  onClickIcon,
  displayAsBadges = false,
}) {
  const maxItemsToShow = 8;
  const displayData = Object.entries(data).slice(0, maxItemsToShow);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    data = {};
  }

  return (
    <div
      className="p-4 bg-background rounded-lg shadow-md cursor-pointer"
    >
      {/* Title and Icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span
          onClick={onClickIcon}
          className="cursor-pointer text-foreground hover:bg-darker-background p-2 rounded-md"
        >
          <Maximize2 size={18} />
        </span>
      </div>

      {/* List or Empty Text */}
      <div>
        {Object.keys(data).length > 0 ? (
          <>
            {displayAsBadges ? (
              <div className="flex flex-wrap items-center space-x-2 mb-2">
                {displayData.map(([key, value]) => (
                  <Tooltip key={key}>
                    <TooltipTrigger>
                      <Badge
                        className="bg-chart-5 text-white hover:bg-chart-5/75 mb-2 max-w-20"
                      >
                        <span className="line-clamp-1 break-all">{key}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <h4>{key}</h4>
                      <p>{value}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ) : (
              displayData.map(([key, value]) => (
                <React.Fragment key={key}>
                  <div className="text-muted-foreground">
                    {key}: {value}
                  </div>
                  <Separator />
                </React.Fragment>
              ))
            )}
            {Object.keys(data).length > maxItemsToShow && (
              <div className="text-muted-foreground mt-2 " onClick={onClickIcon}>...<span className="hover:underline">show more</span></div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground">{emptyText}</div>
        )}
      </div>
    </div>
  );
}

export default CompactListBox;
