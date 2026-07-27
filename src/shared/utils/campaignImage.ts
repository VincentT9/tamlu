export const FLOOD_CAMPAIGN_FALLBACK_IMAGE = "/images/flood-rescue-boat.png";

export function getCampaignImageUrl(imageUrl?: string | null) {
  const trimmedUrl = imageUrl?.trim();
  return trimmedUrl || FLOOD_CAMPAIGN_FALLBACK_IMAGE;
}

export function setCampaignImageFallback(event: { currentTarget: HTMLImageElement }) {
  const image = event.currentTarget;
  if (image.getAttribute("src") !== FLOOD_CAMPAIGN_FALLBACK_IMAGE) {
    image.src = FLOOD_CAMPAIGN_FALLBACK_IMAGE;
  }
}
