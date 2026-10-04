import {
  apiErrorResponse,
  requireAllowedUser,
  requireDevelopmentWrites,
} from "@/lib/data/api";
import {
  DataNotFoundError,
  getTopic,
  saveTopic,
  TopicRevisionConflictError,
} from "@/lib/data/repository";
import { isLearningAreaId } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ areaId: string; topicId: string }> },
) {
  try {
    await requireAllowedUser(request);
    const { areaId: rawAreaId, topicId } = await params;
    if (!isLearningAreaId(rawAreaId)) {
      return Response.json({ error: "Learning area not found." }, { status: 404 });
    }
    return Response.json({
      data: await getTopic(rawAreaId, topicId),
    });
  } catch (error) {
    if (error instanceof DataNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    return apiErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ areaId: string; topicId: string }> },
) {
  try {
    const uid = await requireAllowedUser(request);
    requireDevelopmentWrites(request);
    const { areaId: rawAreaId, topicId } = await params;
    if (!isLearningAreaId(rawAreaId)) {
      return Response.json({ error: "Learning area not found." }, { status: 404 });
    }
    const body = (await request.json()) as {
      title?: unknown;
      description?: unknown;
      content?: unknown;
      expectedRevision?: unknown;
    };
    if (
      typeof body.title !== "string" ||
      typeof body.description !== "string" ||
      typeof body.content !== "string" ||
      typeof body.expectedRevision !== "number"
    ) {
      return Response.json({ error: "Topic update is invalid." }, { status: 400 });
    }
    const topic = await saveTopic(
      rawAreaId,
      topicId,
      {
        title: body.title,
        description: body.description,
        content: body.content,
        expectedRevision: body.expectedRevision,
      },
      uid,
    );
    return Response.json({ data: topic });
  } catch (error) {
    if (error instanceof DataNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof TopicRevisionConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return apiErrorResponse(error);
  }
}
