type Props = {
  board: number[]
  calledNumbers: number[]
}

const BingoBoard = ({ board, calledNumbers }: Props) => {

  return (

    <div className="grid grid-cols-5 gap-2 max-w-md">

      {board.map((num, index) => {

        const marked = calledNumbers.includes(num)

        return (

          <div
            key={index}
            className={`h-16 flex items-center justify-center rounded font-bold text-lg
              ${marked ? "bg-green-500 text-white" : "bg-gray-200"}
            `}
          >
            {num}
          </div>

        )

      })}

    </div>

  )
}

export default BingoBoard