import { Badge } from "./badge";
import { IconStar } from "./icons";

export function SeloNovo() {
  return <Badge tom="info">Novo</Badge>;
}

export function SeloPro() {
  return (
    <Badge tom="primary">
      <IconStar width={12} height={12} />
      Pro
    </Badge>
  );
}
