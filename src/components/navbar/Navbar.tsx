import { GaugeIcon, GuitarIcon, MetronomeIcon } from "lucide-react";
import { Flex } from "../layout/Flex";
import { InstallButton } from "./InstallButton";
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

        max-md:fixed
        max-md:inset-x-0
        max-md:top-auto
        max-md:bottom-0
        max-md:h-auto
        max-md:min-h-16
        max-md:flex-row-reverse
        max-md:border-t
        max-md:border-b-0
        max-md:pb-[env(safe-area-inset-bottom)]

        sm:px-6
      `}
    >
      <Flex
        align="center"
        justify="start"
        gap={2.5}
        className={`
          flex-1
          cursor-default
          font-display
          text-xl
          font-semibold
          text-pearl-dim

          max-md:hidden
        `}
      >
        <img
          src="/logo.png"
          alt="Do Majeur"
          className="h-10"
        />
        <span className="max-md:hidden">Do Majeur</span>
      </Flex>
      <Flex
        align="center"
        className={`
          flex-1
          justify-center
          gap-6

          max-md:justify-end
        `}
      >
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
      </Flex>
      <Flex
        align="center"
        className={`
          flex-1
          justify-end
          gap-2

          max-md:justify-start
          max-md:gap-6
        `}
      >
        <MuteButton />
        <NotationButton />
        <InstallButton />
      </Flex>
    </nav>
  );
}
