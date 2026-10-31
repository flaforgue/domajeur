import { NavLink, type NavLinkProps } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const navBarLink = cva(`
  flex
  items-center
  rounded-lg
  font-semibold
  no-underline
  transition
`, {
  variants: {
    layout: {
      inline: `
        gap-1
        px-2.5
        py-2
        text-sm

        xl:px-4
      `,
      tab: `
        max-w-24
        min-w-0
        flex-1
        flex-col
        gap-0.5
        px-1
        py-1.5
        text-[11px]
      `,
    },
    isActive: {
      true: `
        bg-brass
        text-ebony
      `,
      false: `
        text-pearl-dim

        hover:bg-ebony-2
        hover:text-pearl
      `,
    },
    isDisabled: {
      true: `
        pointer-events-none
        opacity-40
      `,
      false: "",
    },
  },
  defaultVariants: {
    layout: "inline",
    isDisabled: false,
  },
});

interface NavBarLinkProps extends Omit<NavLinkProps, "className"> {
  layout?: "inline" | "tab";
  isDisabled?: boolean;
}

export function NavBarLink({ layout, isDisabled = false, ...props }: NavBarLinkProps) {
  return (
    <NavLink
      className={({ isActive }) => cn(navBarLink({ layout, isActive, isDisabled }))}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      {...props}
    />
  );
}
