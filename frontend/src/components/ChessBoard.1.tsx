import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";

export const ChessBoard = ({
  board,
  socket,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [to, setTo] = useState<null | Square>(null);
  return (
    <div className="text-white-200">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              return (
                <div
                  onClick={() => {
                    if (from) {
                      setFrom(square?.square ?? null);
                    } else {
                      setTo(square?.square ?? null);
                      socket.send(
                        JSON.stringify({
                          type: "move",
                          payload: {
                            from,
                            to,
                          },
                        })
                      );
                    }
                  }}
                  key={j}
                  className={`w-16 h-16 ${
                    (i + j) % 2 == 0 ? "bg-green-500" : "bg-white"
                  }`}
                >
                  <div className="w-full justify-center flex h-full">
                    <div className="h-full flex flex-col justify-center">
                      {square ? square.type : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
