type SessionActivator = (params: { session: string }) => Promise<void>;

type AuthResource = {
  status?: string | null;
  createdSessionId?: string | null;
  missingFields?: string[];
  unverifiedFields?: string[];
  finalize?: () => Promise<{ error: unknown | null }>;
};

type CompleteAuthSessionParams = {
  resource: AuthResource;
  setActive?: SessionActivator;
  onComplete: () => void;
};

type CompleteAuthSessionResult =
  | { completed: true }
  | { completed: false; message: string };

export function normalizeVerificationCode(value: string, codeLength = 6) {
  return value.replace(/\D/g, "").slice(0, codeLength);
}

export function getClerkErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;

  if (typeof error === "object") {
    const maybeError = error as {
      errors?: Array<{ message?: string; longMessage?: string }>;
      message?: string;
    };

    return (
      maybeError.errors?.[0]?.longMessage ||
      maybeError.errors?.[0]?.message ||
      maybeError.message ||
      fallback
    );
  }

  return fallback;
}

export async function completeAuthSession({
  resource,
  setActive,
  onComplete,
}: CompleteAuthSessionParams): Promise<CompleteAuthSessionResult> {
  if (resource.status !== "complete") {
    return {
      completed: false,
      message: describeIncompleteAuthResource(resource),
    };
  }

  if (typeof resource.finalize === "function") {
    const { error } = await resource.finalize();

    if (error) {
      return {
        completed: false,
        message: getClerkErrorMessage(
          error,
          "We could not finish authentication.",
        ),
      };
    }
  } else if (resource.createdSessionId && setActive) {
    await setActive({ session: resource.createdSessionId });
  } else {
    return {
      completed: false,
      message: "Authentication completed, but Clerk did not return a session.",
    };
  }

  onComplete();
  return { completed: true };
}

function describeIncompleteAuthResource(resource: AuthResource) {
  const missing = resource.missingFields?.filter(Boolean) ?? [];
  const unverified = resource.unverifiedFields?.filter(Boolean) ?? [];

  if (missing.length > 0) {
    return `Verification incomplete. Missing requirements: ${missing.join(", ")}.`;
  }

  if (unverified.length > 0) {
    return `Verification incomplete. Still unverified: ${unverified.join(", ")}.`;
  }

  return `Verification incomplete. Status: ${resource.status ?? "unknown"}.`;
}
