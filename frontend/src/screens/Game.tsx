import { useEffect, useState, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import ChessBoard from "../components/ChessBoard";
import { Chess, Square } from "chess.js";
import { useParams } from "react-router-dom";
import MoveSound from "../assets/move-self.mp3";
import ChatSection from "../components/ChatSection";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const REJOIN_GAME = "rejoin_game";
export const CUSTOM_GAME = "custom_game";
export const REDIRECT = "redirect";
export const START_CUSTOM = "start_custom";
export const MESSAGE_RECEIVED = "message_received";
const audio = new Audio(MoveSound);

export function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) {
    return false;
  }
  const piece = chess.get(from);
  if (piece?.type !== "p") {
    return false;
  }
  if (piece.color !== chess.turn()) {
    return false;
  }
  if (!["1", "8"].some((it) => to.endsWith(it))) {
    return false;
  }
  return true;
}

interface Messages {
  content: string;
  userColor: string | null;
}

const Game = () => {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [moves, setMoves] = useState<any[]>([]);
  const [player1, setPlayer1] = useState("Wannabe Magnus");
  const [player2, setPlayer2] = useState("Waiting for Opponent...");
  const [winner, setWinner] = useState<string | null>(null);
  const [remoteurl, setRemoteUrl] = useState<string | null>(null);
  const [userColor, setUserColor] = useState<string | null>(null);
  const { customGameId } = useParams();
  const [random, setRandom] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState(chess.turn());
  const [inputValue, setInputValue] = useState<string>("");
  const [addName, setAddName] = useState<boolean>(false);
  const [timeWhite, setTimeWhite] = useState<number>(180); // 3 minutes in seconds
  const [timeBlack, setTimeBlack] = useState<number>(180);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<Messages[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = () => {
    setPlayer1(inputValue);
    setAddName(true);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrentTurn((prevTurn) => {
        if (prevTurn === "w") {
          setTimeWhite((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current as NodeJS.Timeout);
              endGame("black");
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          setTimeBlack((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current as NodeJS.Timeout);
              endGame("white");
              return 0;
            }
            return prevTime - 1;
          });
        }
        return prevTurn;
      });
    }, 1000);
  };

  const endGame = (winner: "white" | "black") => {
    setWinner(winner);
    if (socket) {
      socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner },
        })
      );
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    if (socket) {
      if (customGameId) {
        socket.send(
          JSON.stringify({
            type: START_CUSTOM,
            customGameId: customGameId,
          })
        );
      }
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_GAME:
          setUserColor(message.payload.color);
          setBoard(chess.board());
          console.log("Game Started");
          setStarted(true);
          setCurrentTurn(chess.turn()); // Update the turn on INIT_GAME
          setPlayer1(message.payload.player1Name);
          setPlayer2(message.payload.player2Name);
          startTimer();
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          setMoves((prevMoves) => [...prevMoves, move]);
          setCurrentTurn(chess.turn()); // Update the turn after MOVE
          console.log("Move Made");
          audio.play();
          break;
        case GAME_OVER:
          setWinner(message.payload.winner);
          console.log("Game Over");
          clearInterval(timerRef.current as NodeJS.Timeout);
          break;
        case REDIRECT:
          // const url = "http://localhost:5173/game/" + message.gameId;
          const url = "http://playchess.onrender.com/game/" + message.gameId;
          setRemoteUrl(url);
          break;
        case MESSAGE_RECEIVED:
          setMessages((prevMessages) => [
            ...prevMessages,
            message.payload.message,
          ]);
          break;
      }
    };
  }, [socket, chess, customGameId]);

  const customGameHandler = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: CUSTOM_GAME }));
    }
  };

  const handleMove = (move: any) => {
    if (chess.turn() === "w" && userColor !== "white") {
      return;
    }
    if (chess.turn() === "b" && userColor !== "black") {
      return;
    }
    if (socket) {
      if (isPromoting(chess, move.from, move.to)) {
        move.promotion = "q";
        console.log(move);
      }
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: { move },
        })
      );
      chess.move(move);
      setMoves((prevMoves) => [...prevMoves, move]);
      setBoard(chess.board());
      setCurrentTurn(chess.turn()); // Update the turn after handleMove
    }
  };

  useEffect(() => {
    setCurrentTurn(chess.turn()); // Set the initial turn
  }, [chess]);

  if (!socket)
    return (
      <div className="text-white flex justify-center text-2xl items-center min-h-screen">
        Connecting to backend...
      </div>
    );
  return (
    <div className="flex justify-evenly">
      <ChatSection messages={messages} socket={socket} userColor={userColor} />
      <div className="justify-center flex flex-col items-center mr-20">
        <div className="pt-8 max-w-screen-lg w-full">
          {!started && !addName && (
            <div className="text-3xl font-bold mb-4 flex justify-center pb-4">
              <span className="text-white mt-1 mr-3">Your Name!</span>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="ml-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleFormSubmit}
                className="ml-2 p-2 bg-green-500 hover:bg-green-700 text-white rounded"
              >
                Submit
              </button>
            </div>
          )}
          {addName && (
            <h1 className="text-3xl font-bold mb-4 text-white flex justify-center pb-4">
              {player1} vs {player2}
            </h1>
          )}
          <h1 className="text-white text-3xl flex justify-center pb-12">
            {winner
              ? `Winner: ${winner}`
              : `Current Player:  ${
                  userColor
                    ? userColor.charAt(0).toUpperCase() + userColor.slice(1)
                    : "UNKNOWN"
                }`}
          </h1>
          <div className="grid grid-cols-6 gap-4 w-full">
            <div className="col-span-4 w-full flex justify-center">
              <ChessBoard
                setBoard={setBoard}
                chess={chess}
                board={board}
                handleMove={handleMove}
                userColor={userColor}
                timeWhite={timeWhite}
                timeBlack={timeBlack}
              />
            </div>
            <div className="col-span-2 bg-slate-900 w-full flex flex-col items-center ml-24">
              <div className="pt-8">
                {!started && (
                  <button
                    className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                    onClick={() => {
                      setRandom(true);
                      if (socket) {
                        socket.send(
                          JSON.stringify({
                            type: INIT_GAME,
                            payload: { player2: player1 },
                          })
                        );
                      }
                    }}
                  >
                    {random ? "In lobby!" : "Play Random!"}
                  </button>
                )}
              </div>
              {!remoteurl && !started && (
                <button
                  className="text-white text-2xl bg-green-500 mt-8 hover:bg-green-700 px-8 py-4 font-bold rounded"
                  onClick={customGameHandler}
                >
                  Custom!
                </button>
              )}
              {!started && remoteurl && (
                <button
                  className="text-white text-1xl mt-10"
                  onClick={() => {
                    navigator.clipboard.writeText(remoteurl);
                    alert("URL Copied!");
                  }}
                >
                  Click to Copy URL {remoteurl}
                </button>
              )}
              {started && (
                <div>
                  <h2 className="text-white text-2xl flex justify-center mb-8">
                    {started && userColor?.charAt(0) === currentTurn
                      ? "Your Turn"
                      : "Opponent's Turn"}
                  </h2>
                  <h2 className="text-2xl font-bold text-white flex justify-center mb-12">
                    Moves Table
                  </h2>
                  <div className="overflow-auto max-h-80">
                    {" "}
                    <table className="table-auto bg-slate-900 text-white w-full text-center">
                      <thead>
                        <tr className="">
                          <th className="px-6 py-2">Move</th>
                          <th className="px-6 py-2">From</th>
                          <th className="px-10 py-2">To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moves.map((move, index) => (
                          <tr key={index}>
                            <td className="border px-4 py-2">{index + 1}</td>
                            <td className="border px-4 py-2">{move.from}</td>
                            <td className="border px-4 py-2">{move.to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
