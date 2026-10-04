import {
  apiErrorResponse,
  requireAllowedUser,
  requireDevelopmentWrites,
} from "@/lib/data/api";
import {
  DockerGuideRevisionConflictError,
  getDockerGuide,
  saveDockerGuide,
} from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAllowedUser(request);
    return Response.json({ data: await getDockerGuide() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAllowedUser(request);
    requireDevelopmentWrites(request);
    const body = (await request.json()) as {
      guide?: unknown;
      expectedRevision?: unknown;
    };
    const guide = await saveDockerGuide(body.guide, body.expectedRevision);
    return Response.json({ data: guide });
  } catch (error) {
    if (error instanceof DockerGuideRevisionConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return apiErrorResponse(error);
  }
}
