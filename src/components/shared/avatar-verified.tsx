import { IconCheck } from "@/components/ui/icons";

type AvatarVerifiedProps = {
  name: string;
  imageUrl?: string;
  verified?: boolean;
  size?: number;
};

export function AvatarVerified({ name, imageUrl, verified = false, size = 40 }: AvatarVerifiedProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Foto de ${name}`}
            width={size}
            height={size}
            className="rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 font-bold text-primary"
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        {verified && (
          <span
            role="img"
            aria-label="Perfil verificado"
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success text-bg ring-2 ring-surface"
          >
            <IconCheck width={10} height={10} strokeWidth={3.5} />
          </span>
        )}
      </span>
      <span className="font-medium">{name}</span>
    </span>
  );
}
