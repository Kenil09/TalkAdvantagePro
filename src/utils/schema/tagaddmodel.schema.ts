import { z } from "zod";
import { TAG_COLORS } from "../date";

const validColors = TAG_COLORS.map(c => c.value);

export const tagFormSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .trim(),
  color: z.enum(validColors as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid color selected.' }),
  }),
})