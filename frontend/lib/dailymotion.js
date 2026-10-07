/**
 * Utility functions for Dailymotion Player integration using modern geo.dailymotion.com embeds.
 */

export const getDailymotionPlayerId = () => {
    return process.env.NEXT_PUBLIC_DAILYMOTION_PLAYER_ID || 'x576d';
};

/**
 * Extracts the Dailymotion Video ID from various URL formats or raw ID inputs.
 * Supported formats:
 * - https://dai.ly/k1c0grIPFvdn2gEAng4
 * - https://www.dailymotion.com/video/k1c0grIPFvdn2gEAng4
 * - https://www.dailymotion.com/embed/video/k1c0grIPFvdn2gEAng4
 * - https://geo.dailymotion.com/player/x576d.html?video=k1c0grIPFvdn2gEAng4
 * - k1c0grIPFvdn2gEAng4
 */
export const extractDailymotionId = (input) => {
    if (!input) return '';
    const trimmed = String(input).trim();

    // Match standard Dailymotion URL patterns
    const urlMatch = trimmed.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/|geo\.dailymotion\.com\/player\/.*[?&]video=)([a-zA-Z0-9]+)/i);
    if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
    }

    // Fallback: extract single-token alphanumeric ID prefix if query params or trailing slashes exist
    const cleanIdMatch = trimmed.match(/^([a-zA-Z0-9]+)/);
    return cleanIdMatch ? cleanIdMatch[1] : trimmed;
};

/**
 * Generates the modern Dailymotion iframe embed URL:
 * https://geo.dailymotion.com/player/{PLAYER_ID}.html?video={VIDEO_ID}
 */
export const getDailymotionEmbedUrl = (rawInput, options = {}) => {
    const videoId = extractDailymotionId(rawInput);
    if (!videoId) return '';

    const playerId = getDailymotionPlayerId();
    const queryParams = [`video=${videoId}`];

    if (options.autoplay) {
        queryParams.push('autoplay=1');
    }
    if (options.mute) {
        queryParams.push('mute=1');
    }

    return `https://geo.dailymotion.com/player/${playerId}.html?${queryParams.join('&')}`;
};
