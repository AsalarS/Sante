import React from 'react';
import { Separator } from '@/components/ui/separator';
import { SquarePen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function CompactListBox({ title, emptyText = "No items available", data = [], onClickIcon, onClickSelf, displayAsBadges = false }) {
  const maxItemsToShow = 3;
  const displayData = data.slice(0, maxItemsToShow);

  return (
    <div 
      className="p-4 bg-background rounded-lg shadow-md cursor-pointer" 
      onClick={onClickSelf}
    >
      {/* Title and Icon */}
      <div className="flex items-center space-x-2 mb-3">
        <span onClick={onClickIcon} className="cursor-pointer text-foreground">
          <SquarePen />
        </span>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* List or Empty Text */}
      <div>
        {data.length > 0 ? (
          <>
            {displayData.map((item, index) => (
              <React.Fragment key={index}>
                {displayAsBadges ? (
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="flex items-center space-x-1 bg-chart-5 text-foreground hover:bg-chart-5/50">
                      <span>{item}</span>
                      <X className="cursor-pointer text-secondary" size={12} strokeWidth={4}/>
                    </Badge>
                  </div>
                ) : (
                  <div className="text-muted-foreground">{item}</div>
                )}
                {index < displayData.length - 1 && !displayAsBadges && <Separator />}
              </React.Fragment>
            ))}
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
