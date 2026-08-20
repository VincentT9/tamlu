export function getCampaignImageUrl(imageUrl?: string | null) {
  return imageUrl?.trim() ?? "";
}

export function setCampaignImageFallback(event: { currentTarget: HTMLImageElement }) {
  event.currentTarget.hidden = true;
}
