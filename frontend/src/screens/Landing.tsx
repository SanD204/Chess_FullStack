import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex justify-center">
            <img src={"/chessboard.png"} className="max-w-96" />
          </div>
          <div className="pt-8">
            <div className="flex justify-center">
              <h1 className="text-4xl font-bold text-white text-center">
                Play Chess Online on Kartik Chawla's #1 Platform
              </h1>
            </div>
            <div className="pt-10 mt-4 flex justify-center">
              <button
                onClick={() => {
                  navigate("/game");
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold text-2xl py-4 px-8 rounded"
              >
                Play Online!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
