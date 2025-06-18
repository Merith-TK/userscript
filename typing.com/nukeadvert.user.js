// ==UserScript==
// @name         Typing.com Ad Remover
// @description  Removes ads and tracking elements from Typing.com
// @icon         https://typing.com/dist/shared/images/favicons/typing/favicon-32x32.png
// @author       Merith-TK
// @namespace    https://github.com/Merith-TK
// @homepage     https://github.com/Merith-TK/UserScripts
// @supportURL   https://github.com/Merith-TK/UserScripts/issues
// @license      MIT
// @match        https://www.typing.com/*
// @version      1.0.0
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