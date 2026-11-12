export const BP_PRICE_FALLBACK = 250;

export function bpNumber(value) {
    if (value == null || Number.isNaN(Number(value))) return "0";
    return String(Math.round(Number(value) * 100) / 100);
}

// Старые «статусы» из сейвов показываем как карточные дизайны.
const LEGACY_LOOKS = {
    lucky: ["card-sage", "Sage card"], valter: ["card-dusk", "Dusk card"],
    chicken_burger: ["card-ember", "Ember card"], silver: ["card-silver", "Silver card"],
    gold: ["card-gold", "Champagne card"], platinum: ["card-platinum", "Platinum card"],
    legend: ["card-nebula", "Nebula card"], owner: ["card-supernova", "Supernova card"],
    first: ["card-xlavelia", "Xlavelia card"]
};

export function bpCosmeticId(reward) {
    return reward?.cosmetic || (reward?.kind === "status" ? LEGACY_LOOKS[reward.status]?.[0] : "") || "";
}

export function bpRewardText(reward) {
    if (!reward) return "";
    if (reward.kind === "status" && LEGACY_LOOKS[reward.status]) return LEGACY_LOOKS[reward.status][1];
    if (reward.display) return reward.display;
    switch (reward.kind) {
        case "cash": return "$" + bpNumber(reward.value);
        case "lavx": return bpNumber(reward.value) + " LAVX";
        case "ref": return bpNumber(reward.value) + " REF XP";
        case "fee": return "$" + bpNumber(reward.value) + " fee · " + reward.days + "d";
        case "case": return bpCaseTitle(reward.case) + " case";
        case "status": return (reward.label || reward.status) + " card";
        case "custom": return reward.label || "Card customization voucher";
        case "cosmetic": return reward.label || (reward.cosmeticKind === "card" ? "Card design" : reward.cosmetic);
        default: return reward.kind || "";
    }
}

export function bpCaseTitle(rarity) {
    if (!rarity) return "Case";
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function bpSeasonText(season) {
    return season && season.label ? season.label : "Season 1";
}

export function bpCountdown(iso, nowMs) {
    if (!iso) return "";
    const target = new Date(iso).getTime();
    if (!Number.isFinite(target)) return "";
    const now = nowMs || Date.now();
    let diff = Math.floor((target - now) / 1000);
    if (diff <= 0) return "Resetting…";
    const days = Math.floor(diff / 86400);
    diff -= days * 86400;
    const hours = Math.floor(diff / 3600);
    diff -= hours * 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff - minutes * 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (days > 0) return days + "d " + pad(hours) + "h";
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

export function bpProgressLabel(quest) {
    const target = Number(quest.target) || 0;
    const progress = Math.min(Number(quest.progress) || 0, target);
    const fmt = (value) => {
        if (quest.unit === "usd") return "$" + bpNumber(value);
        if (quest.unit === "x") return bpNumber(value) + "x";
        if (quest.unit === "power") return bpNumber(value) + " Power";
        return bpNumber(value);
    };
    return fmt(progress) + " / " + fmt(target);
}

export function bpXpText(level, levelXp, xpPerLevel, maxLevel) {
    if (level >= maxLevel) return "MAX LEVEL";
    return bpNumber(levelXp) + " / " + bpNumber(xpPerLevel) + " XP";
}