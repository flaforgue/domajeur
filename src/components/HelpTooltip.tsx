import { Tooltip } from "react-tooltip";

interface Props {
  id: string;
}

export function HelpTooltip({ id }: Props) {
  return <Tooltip id={id} portalRoot={document.body} style={{ maxWidth: "16rem", zIndex: 70 }} />;
}
