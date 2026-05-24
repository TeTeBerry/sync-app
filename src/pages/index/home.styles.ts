import type { TagTone } from "./home.types";

/** BEM modifier class 映射（与 home.scss 一致） */
export const miniTagToneClass: Record<TagTone, string> = {
  primary: `s-ticket-row__mini-tag--primary`,
  secondary: `s-ticket-row__mini-tag--secondary`,
  amber: `s-ticket-row__mini-tag--amber`,
  cyan: `s-ticket-row__mini-tag--cyan`,
};
