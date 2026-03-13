import type { FrameworkControl } from "./framework";

export interface Template {
  id: string;
  name: string;
  description: string;
  controls: FrameworkControl[];
  createdAt: string;
  updatedAt: string;
}
