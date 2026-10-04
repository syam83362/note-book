import { apiErrorResponse, requireAllowedUser } from "@/lib/data/api";
import { listAreas } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAllowedUser(request);
    return Response.json({ data: await listAreas() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
