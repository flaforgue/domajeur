import type { ReactNode } from "react";
import { ClefTrebleIcon, GaugeIcon, GuitarIcon, ListMusicIcon, MetronomeIcon } from "lucide-react";
import { Flex } from "../layout/Flex";
import { InstallButton } from "./InstallButton";
import { MuteButton } from "./MuteButton";
import { NotationButton } from "./NotationButton";
import { NavBarLink } from "./NavBarLink";

interface PageLink {
  to: string;
  label: string;
  icon: ReactNode;
  isExactMatch?: boolean;
}

const pageLinks: PageLink[] = [
  { to: "/manche", label: "Manche", icon: <GuitarIcon width="20" height="20" /> },
  { to: "/accords", label: "Accords", icon: <ListMusicIcon width="20" height="20" /> },
  { to: "/", label: "Gammes", icon: <ClefTrebleIcon width="20" height="20" />, isExactMatch: true },
  { to: "/accordeur", label: "Accordeur", icon: <GaugeIcon width="20" height="20" /> },
  { to: "/metronome", label: "Métronome", icon: <MetronomeIcon width="20" height="20" /> },
];

export function Navbar() {
  return (
    <>
      <header
        className={`
          sticky
          top-0
          z-30
          flex
          h-16
          items-center
          justify-between
          gap-4
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
          justify="start"
          gap={2.5}
          className={`
            flex-1
            cursor-default
            font-display
            text-xl
            font-semibold
            text-pearl-dim
          `}
        >
          <img
            src="/logo.png"
            alt="Do Majeur"
            className="h-10"
          />
          <span>Do Majeur</span>
        </Flex>
        <nav
          className={`
            flex
            flex-1
            items-center
            justify-center
            gap-6

            max-md:hidden

            xl:gap-2
          `}
        >
          {pageLinks.map(({ to, label, icon, isExactMatch }) => (
            <NavBarLink key={to} to={to} end={isExactMatch}>
              {icon}
              <span className="max-xl:sr-only">{label}</span>
            </NavBarLink>
          ))}
        </nav>
        <Flex
          align="center"
          justify="end"
          gap={2}
          className="flex-1"
        >
          <MuteButton />
          <NotationButton />
          <InstallButton />
        </Flex>
      </header>
      {/* Kept outside the header: its backdrop-blur would become the containing block of a fixed child. */}
      <nav
        className={`
          fixed
          inset-x-0
          bottom-0
          z-30
          flex
          justify-center
          gap-1
          border-t
          border-line
          bg-ebony/82
          px-2
          pt-1.5
          pb-[max(0.375rem,env(safe-area-inset-bottom))]
          backdrop-blur-md

          md:hidden
        `}
      >
        {pageLinks.map(({ to, label, icon, isExactMatch }) => (
          <NavBarLink
            key={to}
            to={to}
            end={isExactMatch}
            layout="tab"
          >
            {icon}
            {label}
          </NavBarLink>
        ))}
      </nav>
    </>
  );
}
