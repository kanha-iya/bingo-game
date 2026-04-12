type Props = {
  board: number[];
  calledNumbers: number[];
};

const BingoBoard = ({ board, calledNumbers }: Props) => {
  return (
    <div
      className="mx-auto grid w-full max-w-md grid-cols-5 gap-1.5 sm:gap-2"
      role="grid"
      aria-label="Bingo board"
    >
      {board.map((num, index) => {
        const marked = calledNumbers.includes(num);

        return (
          <div
            key={index}
            role="gridcell"
            className={`flex aspect-square max-h-16 min-h-10 items-center justify-center rounded-md text-sm font-bold tabular-nums sm:text-base md:max-h-[4.25rem] md:text-lg ${
              marked
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-zinc-200 text-zinc-900"
            }`}
          >
            {num}
          </div>
        );
      })}
    </div>
  );
};

export default BingoBoard;
