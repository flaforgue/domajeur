import { Route, Routes } from "react-router-dom";
import { usePitch } from "./hooks/usePitch";
import { Navbar } from "./components/layout/Navbar";
import { StartGate } from "./components/StartGate";
import { Trainer } from "./pages/trainer/Trainer.page";
import { Tuner } from "./pages/tuner/Tuner.page";
import { Metronome } from "./pages/metronome/Metronome.page";

export default function App() {
  const { isStarted } = usePitch();

  return (
    <>
      <Navbar />
      <div
        className={`
          relative
          min-h-[calc(100vh-80px)]
        `}
      >
        {!isStarted && <StartGate />}
        <Routes>
          <Route path="/" element={<Trainer />} />
          <Route path="/accordeur" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
        </Routes>
      </div>
    </>
  );
}
