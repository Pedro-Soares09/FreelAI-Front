type AvatarVerifiedProps = {
  name: string;
  imageUrl?: string;
  verified?: boolean;
};

export function AvatarVerified({
  name,
  imageUrl,
  verified = false,
}: AvatarVerifiedProps) {
  return (
    <span className="avatar-verified">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`Foto de ${name}`} width={40} height={40} />
      ) : (
        <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
      )}
      <span>{name}</span>
      {verified && <span aria-label="Perfil verificado">✓</span>}
    </span>
  );
}
