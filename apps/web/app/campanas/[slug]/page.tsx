import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { utmSchema } from "@studionomade/validation";
import { CAMPAIGNS, type CampaignSlug } from "../../../campaigns/registry";
import { signFormTimestamp } from "../../../lib/leads/anti-spam";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(CAMPAIGNS).map((slug) => ({ slug }));
}

function campaignFor(slug: string) {
  return CAMPAIGNS[slug as CampaignSlug];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await headers();
  const campaign = campaignFor(slug);
  if (!campaign) return {};
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl";
  const canonical = `${base}/campanas/${slug}`;
  return {
    title: campaign.meta.title,
    description: campaign.meta.description,
    alternates: { canonical },
    openGraph: {
      title: campaign.meta.title,
      description: campaign.meta.description,
      url: canonical,
      images: [{ url: `${canonical}/opengraph-image` }]
    },
    robots:
      process.env.VERCEL_ENV === "production"
        ? { index: true, follow: true }
        : { index: false, follow: false }
  };
}

export default async function CampaignPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  await headers();
  const campaign = campaignFor(slug);
  if (!campaign) notFound();
  const query = await searchParams;
  const utm = {
    ...utmSchema.parse(query),
    gclid: typeof query.gclid === "string" ? query.gclid : undefined,
    fbclid: typeof query.fbclid === "string" ? query.fbclid : undefined
  };
  const timestamp = Date.now();
  const secret = process.env.LEAD_FORM_SECRET;
  if (!secret) throw new Error("LEAD_FORM_SECRET is required to render campaign forms");
  const { Composition, content, accent, formSlug, consentVersion } = campaign;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Studio Nomade",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl"
  };
  return (
    <div data-accent={accent}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <Composition
        content={content}
        utm={utm}
        slug={slug}
        timestamp={String(timestamp)}
        signature={signFormTimestamp(timestamp, secret)}
        formSlug={formSlug}
        consentVersion={consentVersion}
      />
    </div>
  );
}
