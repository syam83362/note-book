import { apiErrorResponse, requireAllowedUser } from "@/lib/data/api";
import { listUserProfiles } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAllowedUser(request);
    const ids = new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
    if (ids.length > 30 || ids.some((id) => id.length > 128)) {
      return Response.json({ error: "Requested profile list is invalid." }, { status: 400 });
    }
    return Response.json({ data: await listUserProfiles(ids) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
