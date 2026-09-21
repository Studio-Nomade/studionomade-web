/* eslint-disable studio-nomade/no-hardcoded-style, no-restricted-syntax -- ImageResponse requires inline, absolute canvas styles. */
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { CAMPAIGNS, type CampaignSlug } from "../../../campaigns/registry";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = CAMPAIGNS[slug as CampaignSlug];
  if (!campaign) notFound();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#0a0a0a",
          color: "#fff",
          fontSize: "72px",
          fontWeight: 800
        }}
      >
        <span style={{ color: "#00c85f" }}>{campaign.content.hero.highlight}</span>
        <span>{campaign.content.hero.title}</span>
        <span style={{ marginTop: "32px", fontSize: "28px" }}>{campaign.content.hero.eyebrow}</span>
      </div>
    ),
    size
  );
}
