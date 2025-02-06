import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import MoveSound from "../assets/move-self.mp3";

const ChessBoard = ({
  chess,
  board,
  handleMove,
  userColor,
  timeWhite,
  timeBlack,
}: {
  chess: Chess;
  setBoard: any;
  userColor: string | null;
  timeWhite: number;
  timeBlack: number;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  handleMove: (move: { from: Square; to: Square }) => void;
}) => {
  const audio = new Audio(MoveSound);
  const [from, setFrom] = useState<null | Square>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  useEffect(() => {
    if (userColor) {
      setIsFlipped(userColor === "black");
    }
  }, [userColor]);

  const getLegalMoves = (square: Square) => {
    const moves = chess.moves({ square, verbose: true });
    return moves.map((move) => move.to);
  };

  const handleSquareClick = (squareRepresentation: Square) => {
    if (!from) {
      setFrom(squareRepresentation);
      setLegalMoves(getLegalMoves(squareRepresentation));
    } else {
      const move = { from, to: squareRepresentation };
      setFrom(null);
      setLegalMoves([]);
      handleMove(move);
      console.log(move);
      audio.play();
    }
  };

  return (
    <div className="flex">
      <div>
        {/* <h3 className="text-white text-2xl mr-16 text-center">
          Currently Moving From {!from && "~"}
          {from && from}
        </h3> */}
        <div className="justify-center pr-16 mt-16">
          <div className="text-white text-3xl flex justify-center mb-4 font-bold">
            Clock
          </div>
          <div className="flex">
            <div className="text-white text-2xl px-4">White {timeWhite}</div>
            <div className="text-white text-2xl px-4">Black {timeBlack}</div>
          </div>
        </div>
      </div>
      <div className="text-white-200 pr-12">
        {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
          const rowIndex = isFlipped ? 7 - i : i;
          return (
            <div key={rowIndex} className="flex">
              {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                const colIndex = isFlipped ? 7 - j : j;
                const squareRepresentation = (String.fromCharCode(
                  97 + (colIndex % 8)
                ) +
                  "" +
                  (8 - rowIndex)) as Square;
                const isLegalMove = legalMoves.includes(squareRepresentation);
                return (
                  <div
                    onClick={() => handleSquareClick(squareRepresentation)}
                    key={colIndex}
                    className={`w-16 h-16 ${
                      (rowIndex + colIndex) % 2 == 0
                        ? "bg-green-500"
                        : "bg-white"
                    } ${isLegalMove ? "border-4 border-yellow-500" : ""}`}
                  >
                    <div className="w-full justify-center flex h-full">
                      <div className="h-full flex flex-col justify-center">
                        {square ? (
                          <img
                            className="w-14"
                            src={`/${
                              square?.color === "b"
                                ? square?.type
                                : `${square?.type?.toUpperCase()} copy`
                            }.png`}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
