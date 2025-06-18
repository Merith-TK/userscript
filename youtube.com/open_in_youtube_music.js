// ==UserScript==
// @name         Open in YouTube Music
// @namespace    https://github.com/Merith-TK/
// @version      1.4
// @description  Adds a button to YouTube to open the current video in YouTube Music
// @author       Merith-TK
// @match        https://www.youtube.com/*
// @grant        none
// @license      MIT
// @homepage     https://openuserjs.org/scripts/Merith-TK/Open_in_YouTube_Music
// @esversion    6
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the #owner element to load
    const waitForOwner = setInterval(function() {
        const ownerElement = document.querySelector("#owner");
        if (ownerElement) {
            clearInterval(waitForOwner);

            // Check if the button already exists
            const existingButton = ownerElement.querySelector("#yt-music-button");
            if (existingButton) {
                existingButton.remove(); // Remove the existing button
                console.log("Existing button removed.");
            }

            // Create a button element
            var musicButton = document.createElement("button");
            musicButton.textContent = "Open in YouTube Music"; // Your button text
            musicButton.id = "yt-music-button"; // Unique ID for the button
            musicButton.className = "yt-spec-button-shape-next yt-spec-button-shape-next--filled yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m"; // Add relevant classes
            musicButton.style.border = "none"; // No border to match
            musicButton.style.borderRadius = "12px"; // More rounded corners
            musicButton.style.padding = "10px 20px"; // Increased padding for better spacing
            musicButton.style.cursor = "pointer"; // Pointer on hover
            musicButton.style.color = "#FFFFFF"; // White text
            musicButton.style.backgroundColor = "#FF0000"; // Red background color
            musicButton.style.marginLeft = "10px"; // Indent to the right

            // Append the button to the #owner element
            ownerElement.appendChild(musicButton);

            // Log a message for verification
            console.log("YouTube Music button added successfully!");

            // Redirect to YouTube Music when the button is clicked
            musicButton.onclick = function() {
                const currentUrl = window.location.href;
                const musicUrl = currentUrl.replace("www.youtube.com", "music.youtube.com");
                window.location.href = musicUrl;
            };

            // Add hover effects
            musicButton.addEventListener('mouseenter', function() {
                musicButton.style.backgroundColor = "#CC0000"; // Darker red on hover
            });

            musicButton.addEventListener('mouseleave', function() {
                musicButton.style.backgroundColor = "#FF0000"; // Original red color
            });
        }
    }, 500);
})();
