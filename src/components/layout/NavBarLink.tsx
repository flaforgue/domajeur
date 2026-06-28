import { NavLink, type NavLinkProps } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const navBarLink = cva(`
  flex
  items-center
  gap-1
  rounded-lg
  px-2.5
  py-2
  text-sm
  font-semibold
  no-underline
  transition

  md:px-4
`, {
  variants: {
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
  defaultVariants: { isDisabled: false },
});

interface NavBarLinkProps extends Omit<NavLinkProps, "className"> {
  isDisabled?: boolean;
}

export function NavBarLink({ isDisabled = false, ...props }: NavBarLinkProps) {
  return (
    <NavLink
      className={({ isActive }) => cn(navBarLink({ isActive, isDisabled }))}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      {...props}
    />
  );
}
