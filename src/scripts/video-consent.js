(() => {
    'use strict';
    const VERSION = 1;
    const TTL = 180 * 24 * 60 * 60 * 1000;
    const providers = ['youtube', 'vimeo'];
    const key = provider => `sb-video-consent-${provider}`;
    const choices = {};
    let storageFailed = false;
    const valid = record => record && record.version === VERSION && record.granted === true
        && Number.isFinite(record.at) && record.at <= Date.now() && record.at + TTL > Date.now();

    providers.forEach(provider => {
        try {
            const raw = localStorage.getItem(key(provider));
            try { choices[provider] = JSON.parse(raw); } catch (_) { choices[provider] = null; }
            if (raw && !valid(choices[provider])) {
                localStorage.removeItem(key(provider));
                choices[provider] = null;
            }
        } catch (_) { storageFailed = true; }
    });

    function render() {
        document.querySelectorAll('[data-video-provider]').forEach(box => {
            const provider = box.dataset.videoProvider;
            const allowed = providers.includes(provider) && valid(choices[provider]);
            const message = box.querySelector('.sb-video-consent-message');
            const player = box.querySelector('.sb-video-consent-player');
            const cover = box.querySelector('.sb-video-consent-cover');
            if (cover) cover.hidden = allowed || cover.dataset.failed === 'true';
            message.hidden = allowed;
            box.querySelectorAll('[data-video-open]').forEach(button => { button.hidden = false; });
            const dialog = box.querySelector('dialog');
            if (allowed && dialog.open) dialog.close();
            if (!allowed) { player.replaceChildren(); return; }
            if (player.querySelector('iframe')) return;
            const url = new URL(box.dataset.videoSrc);
            const permitted = provider === 'youtube'
                ? ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname) && url.pathname.startsWith('/embed/')
                : url.hostname === 'player.vimeo.com' && url.pathname.startsWith('/video/');
            if (!permitted || url.protocol !== 'https:') return;
            const iframe = document.createElement('iframe');
            iframe.title = box.dataset.videoTitle;
            iframe.allow = 'fullscreen; picture-in-picture; encrypted-media';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.src = url.href;
            player.append(iframe);
        });
        document.querySelectorAll('[data-video-preferences-open]').forEach(node => { node.hidden = false; });
        providers.forEach(provider => {
            const allowed = valid(choices[provider]);
            document.querySelectorAll(`[data-video-status="${provider}"]`).forEach(node => { node.textContent = allowed ? 'autorizzato' : 'bloccato'; });
            document.querySelectorAll(`[data-video-revoke="${provider}"]`).forEach(node => { node.hidden = !allowed; });
        });
        document.querySelectorAll('[data-video-storage-note]').forEach(node => { node.hidden = !storageFailed; });
    }

    document.addEventListener('click', event => {
        if (event.target.closest('[data-video-preferences-open]')) {
            document.querySelector('.sb-video-preferences').showModal();
            return;
        }
        const open = event.target.closest('[data-video-open]');
        if (open) {
            open.closest('[data-video-provider]').querySelector('dialog').showModal();
            return;
        }
        const accept = event.target.closest('[data-video-accept]');
        const revoke = event.target.closest('[data-video-revoke]');
        if (!accept && !revoke) return;
        const provider = accept ? accept.dataset.videoAccept : revoke.dataset.videoRevoke;
        if (!providers.includes(provider)) return;
        if (accept) accept.closest('dialog').close();
        choices[provider] = accept ? { version: VERSION, granted: true, at: Date.now() } : null;
        try {
            if (accept) localStorage.setItem(key(provider), JSON.stringify(choices[provider]));
            else localStorage.removeItem(key(provider));
        } catch (_) { storageFailed = true; }
        render();
        // Keep focus on a visible control after replacing the player or hiding a button.
        if (revoke) revoke.closest('dialog').querySelector('[data-video-preferences-close]').focus();
        else {
            const player = accept.closest('[data-video-provider]').querySelector('iframe');
            if (player) player.focus();
        }
    });
    window.addEventListener('storage', event => {
        if (event.key !== null && !providers.some(provider => event.key === key(provider))) return;
        providers.forEach(provider => {
            try { choices[provider] = JSON.parse(localStorage.getItem(key(provider))); }
            catch (_) { choices[provider] = null; }
        });
        render();
    });
    window.addEventListener('pageshow', render);
    document.querySelectorAll('.sb-video-consent-cover').forEach(image => {
        const hideFailedCover = () => { image.dataset.failed = 'true'; image.hidden = true; };
        image.addEventListener('error', hideFailedCover);
        if (image.complete && image.naturalWidth === 0) hideFailedCover();
    });
    window.addEventListener('focus', render);
    render();
})();
