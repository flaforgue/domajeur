import { GaugeIcon, GuitarIcon, MetronomeIcon } from "lucide-react";
import { Flex } from "../layout/Flex";
import { MuteButton } from "./MuteButton";
import { NotationButton } from "./NotationButton";
import { NavBarLink } from "./NavBarLink";

export function Navbar() {
  return (
    <nav
      className={`
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-line
        bg-ebony/82
        px-4
        backdrop-blur-md

        sm:px-6
      `}
    >
      <Flex
        align="center"
        gap={2.5}
        className={`
          cursor-default
          font-display
          text-xl
          font-semibold
          text-pearl-dim
        `}
      >
        <Flex
          align="center"
          justify="center"
        >
          <img
            src="/logo.png"
            alt="Do Majeur"
            className="h-10"
          />
        </Flex>
        <span className="max-md:hidden">Do Majeur</span>
      </Flex>
      <Flex align="center" gap={2}>
        <NavBarLink to="/" end>
          <GuitarIcon width="20" height="20" />
          <span className="max-md:hidden">Entraînement</span>
        </NavBarLink>
        <NavBarLink to="/accordeur">
          <GaugeIcon width="20" height="20" />
          <span className="max-md:hidden">Accordeur</span>
        </NavBarLink>
        <NavBarLink to="/metronome">
          <MetronomeIcon width="20" height="20" />
          <span className="max-md:hidden">Métronome</span>
        </NavBarLink>
        <MuteButton />
        <NotationButton />
      </Flex>
    </nav>
  );
}
