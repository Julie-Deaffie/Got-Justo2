document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionInputsContainer = document.getElementById('connectionInputsContainer');
    const displayPriceSpan = document.getElementById('displayPrice');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const noAddOnsMessage = document.querySelector('.no-add-ons-message');
    const resetButton = document.getElementById('resetButton');

    let selectedProduct = 'A';
    let selectedDurationMonths = 1;
    let iptvConnections = 1;
    let vodConnections = 1;
    let selectedAddOns = new Set(); 

    const ADDON_RATE = 0.50; // $0.50 per connection per month

    const pricing = {
        'A': {
            basePrices: { 1: 9, 3: 24, 6: 45, 12: 84 }, //
            extraConnRates: { 1: 3, 3: 8, 6: 15, 12: 30 }, //
            addOns: [{ id: 'iptv_a', name: 'Adult' }, { id: 'iptv_24', name: '24/7' }, { id: 'iptv_bw', name: 'Low BW' }]
        },
        'B': {
            basePrices: { 1: 8, 3: 21, 6: 39, 12: 72 }, //
            extraConnRates: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, //
            addOns: [{ id: 'vod_24', name: '24/7' }, { id: 'vod_a', name: 'Adult' }]
        }
    };

    function renderConnectionSelectors() {
        connectionInputsContainer.innerHTML = '';
        if (selectedProduct === 'C') {
            createSlider('IPTV Connections', (val) => { iptvConnections = val; calculatePrice(); }, iptvConnections);
            createSlider('VOD Connections', (val) => { vodConnections = val; calculatePrice(); }, vodConnections);
        } else {
            const label = selectedProduct === 'A' ? 'IPTV Connections' : 'VOD Connections';
            const currentVal = selectedProduct === 'A' ? iptvConnections : vodConnections;
            createSlider(label, (val) => { 
                iptvConnections = val; 
                vodConnections = val; 
                calculatePrice(); 
            }, currentVal);
        }
    }

    function createSlider(labelText, onInput, startVal) {
        const div = document.createElement('div');
        div.className = 'users-input-group-wrapper';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="font-size: 0.7em; color: #fff; text-transform: uppercase;">${labelText}</span>
                <span class="slider-display" style="color: #39ff14;">${startVal}</span>
            </div>
            <input type="range" min="1" max="5" value="${startVal}" class="conn-slider">
        `;
        const slider = div.querySelector('input');
        const display = div.querySelector('.slider-display');
        slider.oninput = (e) => {
            const val = parseInt(e.target.value);
            display.textContent = val;
            onInput(val);
        };
        connectionInputsContainer.appendChild(div);
    }

    function renderAddOns() {