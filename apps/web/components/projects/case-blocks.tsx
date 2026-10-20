import type { CaseBlock, PublicProject } from "../../content/projects";
import { CaseBento } from "./blocks/case-bento";
import { CaseChallenge } from "./blocks/case-challenge";
import { CaseCredits } from "./blocks/case-credits";
import { CaseGrid } from "./blocks/case-grid";
import { CaseHero } from "./blocks/case-hero";
import { CaseMediaBlock } from "./blocks/case-media-block";
import { CaseNarrative } from "./blocks/case-narrative";
import { CaseObjectives } from "./blocks/case-objectives";
import { CasePhones } from "./blocks/case-phones";
import { CaseSlider } from "./blocks/case-slider";
import { CaseStatement } from "./blocks/case-statement";
import { CaseStrip } from "./blocks/case-strip";
import { CaseZones } from "./blocks/case-zones";

/** Traduce un bloque del contenido a su componente. */
export function CaseBlockView({ block, project }: { block: CaseBlock; project: PublicProject }) {
  switch (block.type) {
    case "hero":
      return <CaseHero block={block} project={project} />;
    case "statement":
      return <CaseStatement block={block} project={project} />;
    case "objectives":
      return <CaseObjectives block={block} />;
    case "challenge":
      return <CaseChallenge block={block} />;
    case "media":
      return <CaseMediaBlock block={block} />;
    case "grid":
      return <CaseGrid block={block} />;
    case "bento":
      return <CaseBento block={block} />;
    case "narrative":
      return <CaseNarrative block={block} />;
    case "strip":
      return <CaseStrip block={block} />;
    case "phones":
      return <CasePhones block={block} />;
    case "slider":
      return <CaseSlider block={block} />;
    case "zones":
      return <CaseZones block={block} />;
    case "credits":
      return <CaseCredits block={block} />;
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
