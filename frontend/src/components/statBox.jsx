import React from 'react';

function StatBox ({ title, number }) {
  return (
    <div className="p-4 bg-primary-400 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-4xl font-bold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
        {number}
      </div>
    </div>
  );
};

export default StatBox;
