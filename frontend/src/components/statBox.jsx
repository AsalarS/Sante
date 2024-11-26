function StatBox({ title, number }) {
  return (
    <div className="p-4 bg-background rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between lg:h-20">
      <div className="w-full md:w-auto mb-2 md:mb-0">
        <h3 className="text-lg md:text-md font-semibold text-foreground text-center md:text-left">
          {title}
        </h3>
      </div>
      <div className="text-4xl md:text-3xl font-bold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text text-center md:text-right">
        {number}
      </div>
    </div>
  );
}

export default StatBox;