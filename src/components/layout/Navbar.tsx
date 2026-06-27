import { GaugeIcon, GuitarIcon, MetronomeIcon } from "lucide-react";
import { usePitch } from "../../hooks/usePitch";
import { Flex } from "./Flex";
import { SettingsMenu } from "./SettingsMenu";
import { NavBarLink } from "./NavBarLink";

export function Navbar() {
  const { isStarted } = usePitch();

  return (
    <nav
      className={`
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-line
        bg-ebony/82
        px-6
        backdrop-blur-md
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

          ${isStarted ? "" : "opacity-40"}
        `}
      >
        <Flex
          align="center"
          justify="center"
          className={`
            aspect-square
            rounded-full
            bg-brass
            p-1
          `}
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Do Majeur"
            className="h-10"
          />
        </Flex>
        Do Majeur
      </Flex>
      <Flex align="center" gap={2}>
        <NavBarLink to="/" end isDisabled={!isStarted}>
          <GuitarIcon width="20" height="20" />
          Entraînement
        </NavBarLink>
        <NavBarLink to="/accordeur" isDisabled={!isStarted}>
          <GaugeIcon width="20" height="20" />
          Accordeur
        </NavBarLink>
        <NavBarLink to="/metronome" isDisabled={!isStarted}>
          <MetronomeIcon width="20" height="20" />
          Métronome
        </NavBarLink>
        <SettingsMenu />
      </Flex>
    </nav>
  );
}
