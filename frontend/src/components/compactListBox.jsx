import React from 'react';
import { Maximize2, SquarePen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function CompactListBox({ title, emptyText = "No items available", data = [], onClickIcon, onClickSelf, displayAsBadges = false }) {
  const maxItemsToShow = 8;
  const displayData = data.slice(0, maxItemsToShow);

  return (
    <div 
      className="p-4 bg-background rounded-lg shadow-md cursor-pointer" 
      onClick={onClickSelf}
    >
      {/* Title and Icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span onClick={onClickIcon} className="cursor-pointer text-foreground hover:bg-darker-background p-2 rounded-md">
          <Maximize2 size={18}/>
        </span>
      </div>

      {/* List or Empty Text */}
      <div>
        {data.length > 0 ? (
          <>
            {displayAsBadges ? (
              <div className="flex flex-wrap items-center space-x-2 mb-2">
                {displayData.map((item, index) => (
                  <Badge key={index} className="flex items-center space-x-1 bg-chart-5 text-white hover:bg-chart-5/75 mb-2">
                    <span>{item}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              displayData.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="text-muted-foreground">{item}</div>
                  {index < displayData.length - 1 && <Separator />}
                </React.Fragment>
              ))
            )}
            {data.length > maxItemsToShow && (
              <div className="text-muted-foreground mt-2">...show more</div>
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
