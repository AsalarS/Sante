import React from 'react';
import { Separator } from '@/components/ui/separator'; 
import { SquarePen } from 'lucide-react';

function CompactListBox({ title, emptyText = "No items available", data = [], onClickIcon, onClickSelf }) {
  const maxItemsToShow = 3;
  const displayData = data.slice(0, maxItemsToShow);

  return (
    <div 
      className="p-4 bg-background dark:bg-dark-background rounded-lg shadow-md cursor-pointer" 
      onClick={onClickSelf}
    >
      {/* Title and Icon */}
      <div className="flex items-center space-x-2 mb-3">
        <span onClick={onClickIcon} className="cursor-pointer text-foreground">
          <SquarePen />
        </span>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* List or Empty Text */}
      <div>
        {data.length > 0 ? (
          <>
            {displayData.map((item, index) => (
              <React.Fragment key={index}>
                <div className="text-muted-foreground">{item}</div>
                {index < displayData.length - 1 && <Separator/>}
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
