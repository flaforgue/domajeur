import { Route, Routes } from "react-router-dom";
import { HelpTooltip } from "./components/HelpTooltip";
import { Navbar } from "./components/navbar/Navbar";
import { Trainer } from "./pages/trainer/Trainer.page";
import { Tuner } from "./pages/tuner/Tuner.page";
import { Metronome } from "./pages/metronome/Metronome.page";

export default function App() {
  return (
    <>
      <Navbar />
      <div
        className={`
          relative
          min-h-[calc(100vh-80px)]

          max-md:pb-20
        `}
      >
        <Routes>
          <Route path="/" element={<Trainer />} />
          <Route path="/accordeur" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
        </Routes>
      </div>
      <HelpTooltip />
    </>
  );
}
