import "server-only";
import { listUserProfiles } from "./repository";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function requireAllowedUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) {
    throw new ApiError("Sign in to access learning data.", 401);
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new ApiError("Firebase Authentication is not configured on the server.", 503);
  }

  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
      },
    );
  } catch {
    throw new ApiError("Firebase Authentication could not be reached.", 503);
  }

  if (!response.ok) {
    throw new ApiError("Your sign-in has expired. Sign in again to continue.", 401);
  }
  const identity = (await response.json()) as {
    users?: Array<{ localId?: string }>;
  };
  const uid = identity.users?.[0]?.localId;
  if (!uid) {
    throw new ApiError("Firebase did not return a valid user identity.", 401);
  }

  const allowed = await listUserProfiles([uid]);
  if (!allowed.some((profile) => profile.uid === uid)) {
    throw new ApiError(
      "Your Firebase UID is not active in data/users.json. Ask the workspace maintainer to add it.",
      403,
    );
  }
  return uid;
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Learning data API request failed.", error);
  if (error instanceof SyntaxError) {
    return Response.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  return Response.json(
    { error: "Learning data request failed. Check the server logs for details." },
    { status: 500 },
  );
}

export function requireDevelopmentWrites(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(
    requestUrl.hostname,
  );
  if (
    process.env.NODE_ENV !== "development" ||
    !isLocalHost ||
    (origin && origin !== requestUrl.origin)
  ) {
    throw new ApiError(
      "Editing is enabled only from a local development server. A trusted API write service is a future requirement.",
      403,
    );
  }
}
