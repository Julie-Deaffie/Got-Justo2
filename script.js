document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionContainer = document.getElementById('connectionContainer');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const displayPriceSpan = document.getElementById('displayPrice');
    const summaryDisplay = document.getElementById('summaryDisplay');
    const resetButton = document.getElementById('resetButton');

    let state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() };
    const ADDON_RATE = 0.50;

    const pricing = {
        'A': { base: { 1: 9, 3: 24, 6: 45, 12: 84 }, extra: { 1: 3, 3: 8, 6: 15, 12: 30 }, 
               name: "IPTV", addons: [{id:'a1', name:'ADULT'}, {id:'a2', name:'BW'}, {id:'a3', name:'24/7'}] },
        'B': { base: { 1: 8, 3: 21, 6: 39, 12: 72 }, extra: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, 
               name: "VOD", addons: [{id:'b1', name:'ADULT'}, {id:'b2', name:'24/7'}] },
        'C': { name: "BUNDLE (IPTV+VOD)" }
    };

    function calculate() {
        let total = 0;
        let summaryText = "";
        
        // 1. Logic for Summary & Math
        if (state.product === 'A' || state.product === 'C') {
            const p = pricing['A'];
            total += p.base[state.duration] + (state.iptv - 1) * p.extra[state.duration];
            total += state.addons.size * ADDON_RATE * state.iptv * state.duration;
            summaryText += `${state.iptv}x IPTV Node(s)`;
        }

        if (state.product === 'C') summaryText += " + ";

        if (state.product === 'B' || state.product === 'C') {
            const p = pricing['B'];
            total += p.base[state.duration] + (state.vod - 1) * p.extra[state.duration];
            if (state.product === 'B') total += state.addons.size * ADDON_RATE * state.vod * state.duration;
            summaryText += `${state.vod}x VOD Node(s)`;
        }

        // 2. Final UI Update
        displayPriceSpan.innerText = total.toFixed(2);
        
        const addonList = Array.from(state.addons).map(id => {
            const allAddons = [...pricing.A.addons, ...pricing.B.addons];
            return allAddons.find(a => a.id === id)?.name;
        }).join(", ");

        summaryDisplay.innerHTML = `
            <div class="summary-line">${state.duration} Month ${pricing[state.product].name}</div>
            <div class="summary-line">${summaryText}</div>
            <div class="summary-addons">${addonList ? "+ " + addonList : "No Add-ons Selected"}</div>
        `;
    }

    // ... renderConnections and renderAddons remain same as previous step ...
    // Make sure renderAddons calls calculate() at the end
    
    function resetCalculator() {
        state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() };
        document.querySelector('[data-product="A"]').click();
        document.querySelector('[data-duration="1"]').click();
    }

    // Binding
    resetButton.onclick = resetCalculator;
    // Initial Run
    resetCalculator();
});