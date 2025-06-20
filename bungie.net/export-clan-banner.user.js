// ==UserScript==
// @name         Destiny 2 Clan Banner Extractor
// @description  Download Destiny 2 Clan Banner Layers (Auto Crop + ZIP Export)
// @icon         https://www.bungie.net/favicon-32x32.png
// @author       Merith-TK
// @namespace    https://github.com/Merith-TK
// @homepage     https://github.com/Merith-TK/UserScripts
// @supportURL   https://github.com/Merith-TK/UserScripts/issues
// @license      MIT
// @match        https://www.bungie.net/en/ClanV2/bannercreator?groupid=*
// @version      8.0.0
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function() {
    'use strict';

    const canvasIdsInOrder = [
        'bg',
        'flagdetail',
        'emblembg',
        'emblemfg',
        'bannerMasked',
        'staff' // Added pole as a separate layer
    ];
    const solidBackgroundColor = 'white'; // change this color as needed (e.g., 'white', 'blue', '#ff5733')

    const cropArea = { x: 48, y: 40, width: 400, height: 600 }; // Default crop area for most layers
    const finalCropArea = { x: 40, y: 40, width: 410, height: 800 }; // Different crop area for the final layer

    // Function to create a merged banner with cropped content
    function createMergedBanner() {
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = 496;
        mergedCanvas.height = 1034;
        const ctx = mergedCanvas.getContext('2d');

        // Replace wavy background with solid color
        // ctx.fillStyle = solidBackgroundColor;
        // ctx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height); // Fill with solid color

        // Draw the layers (excluding background effect layers like flagdetail)
        canvasIdsInOrder.forEach(id => {
            const layer = document.getElementById(id);
            if (layer) {
                ctx.drawImage(layer, 0, 0);
            } else {
                console.warn(`⚠️ Layer ${id} not found`);
            }
        });

        return cropCanvas(mergedCanvas);
    }

    // Function to crop canvas to a specific area
    function cropCanvas(sourceCanvas, cropSettings = cropArea) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropSettings.width;
        croppedCanvas.height = cropSettings.height;
        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
            sourceCanvas,
            cropSettings.x, cropSettings.y, cropSettings.width, cropSettings.height, // source crop
            0, 0, cropSettings.width, cropSettings.height // destination
        );
        return croppedCanvas;
    }

    // Function to detect the bounding box of the banner based on pixel content
    function autoDetectBannerCrop() {
        const canvas = document.createElement('canvas');
        canvas.width = 496;
        canvas.height = 1034;
        const ctx = canvas.getContext('2d');

        // Draw the layers
        canvasIdsInOrder.forEach(id => {
            const layer = document.getElementById(id);
            if (layer) {
                ctx.drawImage(layer, 0, 0);
            } else {
                console.warn(`⚠️ Layer ${id} not found`);
            }
        });

        // Search for the first non-transparent pixel to auto-detect the crop
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let left = canvas.width, right = 0, top = canvas.height, bottom = 0;

        // Scan the image to find the boundary of the banner
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const alpha = pixels[idx + 3];
                if (alpha > 0) { // if pixel is not fully transparent
                    if (x < left) left = x;
                    if (x > right) right = x;
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                }
            }
        }

        // Set the new crop area based on detected bounds
        cropArea.x = left;
        cropArea.y = top;
        cropArea.width = right - left;
        cropArea.height = bottom - top;
        return cropCanvas(canvas);
    }

    // Function to download canvas as PNG
    function downloadCanvas(canvas, filename) {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
        console.log(`✅ Downloaded: ${filename}`);
    }

    // Function to download all layers in ZIP format
    async function downloadLayersAsZip() {
        const zip = new JSZip();

        // Add each layer (including the pole) with appropriate crop
        for (const id of [...canvasIdsInOrder]) {
            const layer = document.getElementById(id);
            if (layer) {
                const cropped = cropCanvas(layer);
                const blob = await new Promise(resolve => cropped.toBlob(resolve, 'image/png'));
                zip.file(`${id}.png`, blob);
            } else {
                console.warn(`⚠️ Layer ${id} not found`);
            }
        }

        // Add the final layer with offset crop
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 496;
        finalCanvas.height = 1034;
        const finalCtx = finalCanvas.getContext('2d');

        // Draw all layers
        canvasIdsInOrder.forEach(id => {
            const layer = document.getElementById(id);
            if (layer) {
                finalCtx.drawImage(layer, 0, 0);
            } else {
                console.warn(`⚠️ Layer ${id} not found`);
            }
        });

        // Crop the final image with the final crop area
        const finalCroppedCanvas = cropCanvas(finalCanvas, finalCropArea);
        const finalBlob = await new Promise(resolve => finalCroppedCanvas.toBlob(resolve, 'image/png'));
        zip.file('final.png', finalBlob);

        // Add combined images
        const mergedUnmasked = createMergedBanner();
        const mergedMasked = createMergedBanner();
        const blobUnmasked = await new Promise(resolve => mergedUnmasked.toBlob(resolve, 'image/png'));
        const blobMasked = await new Promise(resolve => mergedMasked.toBlob(resolve, 'image/png'));

        zip.file("unmasked_combined.png", blobUnmasked);
        zip.file("masked_combined.png", blobMasked);

        zip.generateAsync({type:"blob"}).then(function(content) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = "clan_banner_all_variants.zip";
            a.click();
            console.log("✅ Downloaded: clan_banner_all_variants.zip");
        });
    }

    // Function to show preview of the merged banner
    function showPreview() {
        const mergedCanvas = createMergedBanner();
        const previewWindow = window.open('', '', 'width=520,height=1040');
        const img = new Image();
        img.src = mergedCanvas.toDataURL('image/png');
        previewWindow.document.body.appendChild(img);
    }

    // Add buttons to the page
    function addButton(text, onclick, topOffset) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.position = 'fixed';
        button.style.top = `${topOffset}px`;
        button.style.right = '20px';
        button.style.padding = '10px 15px';
        button.style.zIndex = '10000';
        button.style.backgroundColor = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.onclick = onclick;
        document.body.appendChild(button);
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            addButton('🖼️ Preview Banner', showPreview, 20);
            addButton('🗜️ Download All Variants (ZIP)', () => {
                downloadLayersAsZip();
            }, 80);
        }, 1000);
    });
})();
