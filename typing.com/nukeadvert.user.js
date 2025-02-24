// ==UserScript==
// @name        Typing.com Remove Adverts
// @namespace   Violentmonkey Scripts
// @match       https://www.typing.com/*
// @grant       none
// @version     1.0
// @author      merith@merith.xyz
// @description 1/28/2025, 9:24:16 AM
// ==/UserScript==

(function () {
    'use strict';

    // Remove the ad element
    const removeAds = () => {
        const adElement = document.querySelector('.advert');
        if (adElement) {
            adElement.remove(); // Remove the element from the DOM
        }

        const adElement2 = document.querySelector('#_fs-ad-iframe-container');
        if (adElement2) {
            adElement2.remove();
        }

        const adElement3 = document.querySelector('.primisPlayerContainerDiv');
        if (adElement3) {
            adElement3.remove();
        }

        const adElement4 = document.querySelector('.primis_container_div');
        if (adElement4) {
            adElement4.remove();
        }

    };

    // Run the ad removal function after the page loads
    window.addEventListener('load', removeAds);

    // Optional: Handle dynamic page updates (e.g., single-page applications)
    const observer = new MutationObserver(() => {
        removeAds(); // Check for and remove ads again if they are reinserted
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();