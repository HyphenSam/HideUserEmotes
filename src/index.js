import Settings from "./Settings.jsx";

const { findByProps } = vendetta.metro;
const { storage } = vendetta.plugin;

const FluxDispatcher = findByProps("FluxDispatcher")?.FluxDispatcher;

function shouldHideMessage(msg) {
    const content = msg.content || "";

    // Don't hide messages with attachments, embeds, or stickers
    const hasAttachments = (msg.attachments?.length > 0)
        || (msg.embeds?.length > 0)
        || (msg.sticker_items?.length > 0);
    if (hasAttachments) return false;

    // Don't hide genuinely empty messages
    if (content.trim().length === 0) return false;

    // Strip custom Discord emotes
    let stripped = content.replace(/<a?:[a-zA-Z0-9_]+:[0-9]+>/g, "");

    // Strip Unicode emojis and modifiers
    stripped = stripped.replace(/\p{Extended_Pictographic}/gu, "");
    stripped = stripped.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
    stripped = stripped.replace(/[\u200D\uFE0F]/gu, "");

    return stripped.trim().length === 0;
}

let interceptor = null;

export default {
    onLoad() {
        if (!FluxDispatcher) {
            console.error("[HideUserEmotes] FluxDispatcher not found");
            return;
        }

        interceptor = (event) => {
            const targetId = (storage.targetUserId || "").trim();
            if (!targetId) return;

            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                const msg = event.message;
                if (!msg || !msg.author) return;

                if (msg.author.id === targetId && shouldHideMessage(msg)) {
                    event.type = "HIDE_USER_EMOTES_HIDDEN";
                }
            }

            if (event.type === "LOAD_MESSAGES_SUCCESS") {
                if (event.messages && Array.isArray(event.messages)) {
                    event.messages = event.messages.filter((msg) => {
                        if (msg.author?.id !== targetId) return true;
                        return !shouldHideMessage(msg);
                    });
                }
            }
        };

        FluxDispatcher.addInterceptor?.(interceptor)
            || FluxDispatcher._interceptors?.push?.(interceptor);
    },

    onUnload() {
        if (!interceptor || !FluxDispatcher) return;

        const interceptors = FluxDispatcher._interceptors;
        if (interceptors) {
            const index = interceptors.indexOf(interceptor);
            if (index > -1) interceptors.splice(index, 1);
        }

        interceptor = null;
    },
    settings: Settings
};
