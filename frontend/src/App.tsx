import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import { Auth } from "./screens/Auth";
function App() {
  return (
    <>
      <div className="h-screen bg-slate-950">
        <BrowserRouter basename="">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<Game />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/game/:customGameId" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
