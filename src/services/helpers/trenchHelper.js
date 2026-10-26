const CAMPAIGN_PREFIX_LENGTH = 5;

function trenchCampaign(trenchName) {
  return String(trenchName ?? "").slice(0, CAMPAIGN_PREFIX_LENGTH);
}

function sortCampaignsNewestFirst(campaigns) {
  return [...campaigns].sort().reverse();
}

export { trenchCampaign, sortCampaignsNewestFirst };
