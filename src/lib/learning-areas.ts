import areas from "../../data/areas.json";
import { isLearningAreaId, type LearningArea } from "./data/types";

export const learningAreas: LearningArea[] = areas.map((area) => {
  const id = area.id;
  if (!isLearningAreaId(id)) {
    throw new Error(`Learning area ${id} has an invalid ID.`);
  }
  return { ...area, id };
});
