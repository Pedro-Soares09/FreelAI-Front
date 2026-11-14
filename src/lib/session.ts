export type Session = {
  userId: string;
  accessToken: string;
};

export function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "userId" in value &&
    typeof value.userId === "string" &&
    "accessToken" in value &&
    typeof value.accessToken === "string"
  );
}
