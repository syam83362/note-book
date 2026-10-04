import {
  apiErrorResponse,
  requireAllowedUser,
  requireDevelopmentWrites,
} from "@/lib/data/api";
import { createTopic, listTopics } from "@/lib/data/repository";
import { isLearningAreaId } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ areaId: string }> },
) {
  try {
    await requireAllowedUser(request);
    const { areaId: rawAreaId } = await params;
    if (!isLearningAreaId(rawAreaId)) {
      return Response.json({ error: "Learning area not found." }, { status: 404 });
    }
    return Response.json({ data: await listTopics(rawAreaId) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ areaId: string }> },
) {
  try {
    const uid = await requireAllowedUser(request);
    requireDevelopmentWrites(request);
    const { areaId: rawAreaId } = await params;
    if (!isLearningAreaId(rawAreaId)) {
      return Response.json({ error: "Learning area not found." }, { status: 404 });
    }
    const body = (await request.json()) as {
      title?: unknown;
      description?: unknown;
    };
    if (typeof body.title !== "string" || typeof body.description !== "string") {
      return Response.json({ error: "Topic title and description are required." }, { status: 400 });
    }
    const result = await createTopic(
      rawAreaId,
      body.title,
      body.description,
      uid,
    );
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
