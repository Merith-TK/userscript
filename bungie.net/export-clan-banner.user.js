// ==UserScript==
// @name         Destiny 2 Clan Banner Extractor (Transparent + Cropped + ZIP + Preview)
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Download Destiny 2 Clan Banner as transparent PNG (cropped) or ZIP of cropped layers (including final canvas) with preview popup.
// @author       ChatGPT
// @match        https://www.bungie.net/en/ClanV2/bannercreator?groupid=*
// @icon         https://www.bungie.net/favicon-32x32.png
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function() {
    'use strict';

    const canvasIdsInOrder = [
        'bg',
        'flagdetail',
        'emblembg',
        'emblemfg',
        'bannerMasked'
    ];
    const cropArea = { x: 48, y: 40, width: 400, height: 600 };

    function createMergedBanner() {
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = 496;
        mergedCanvas.height = 1034;
        const ctx = mergedCanvas.getContext('2d');

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

    function cropCanvas(sourceCanvas) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropArea.width;
        croppedCanvas.height = cropArea.height;
        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
            sourceCanvas,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height, // source crop
            0, 0, cropArea.width, cropArea.height // destination
        );
        return croppedCanvas;
    }

    function downloadCanvas(canvas, filename) {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
        console.log(`✅ Downloaded: ${filename}`);
    }

    async function downloadLayersAsZip() {
        const zip = new JSZip();

        for (const id of [...canvasIdsInOrder, 'final']) {
            const layer = document.getElementById(id);
            if (layer) {
                const cropped = cropCanvas(layer);
                const blob = await new Promise(resolve => cropped.toBlob(resolve, 'image/png'));
                zip.file(`${id}.png`, blob);
            } else {
                console.warn(`⚠️ Layer ${id} not found`);
            }
        }

        zip.generateAsync({type:"blob"}).then(function(content) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = "clan_banner_layers_cropped.zip";
            a.click();
            console.log("✅ Downloaded: cropped layers zip");
        });
    }

    function showPreview(canvas) {
        const dataURL = canvas.toDataURL('image/png');

        const previewWindow = window.open("", "_blank", "width=400,height=600");
        previewWindow.document.write(`
            <title>Banner Preview</title>
            <style>
                body { margin:0; background: #333; display: flex; justify-content: center; align-items: center; height: 100vh; }
                img { max-width: 100%; max-height: 100%; }
            </style>
            <img src="${dataURL}" alt="Preview">
        `);
    }

    function addButton(text, onclick, topOffset) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.position = 'fixed';
        button.style.top = `${topOffset}px`;
        button.style.right = '20px';
        button.style.padding = '10px 15px';
        button.style.zIndex = '10000';
        button.style.backgroundColor = '#28a745';
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
            addButton('👀 Preview Transparent', () => {
                const canvas = createMergedBanner();
                showPreview(canvas);
            }, 20);

            addButton('📥 Download Transparent', () => {
                const canvas = createMergedBanner();
                downloadCanvas(canvas, 'destiny2_clan_banner_cropped.png');
            }, 70);

            addButton('🗜️ Download Layers ZIP', () => {
                downloadLayersAsZip();
            }, 120);

        }, 1000);
    });
})();
