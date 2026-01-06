document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionInputsContainer = document.getElementById('connectionInputsContainer');
    const displayPriceSpan = document.getElementById('displayPrice');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const noAddOnsMessage = document.querySelector('.no-add-ons-message');
    const resetButton = document.getElementById('resetButton');

    let selectedProduct = null;
    let selectedDurationMonths = null;
    let iptvConnections = 1;
    let vodConnections = 1;
    let selectedAddOns = new Set(); 

    const ADDON_RATE = 0.50; // $0.50 per connection per month

    const pricing = {
        'A': {
            basePrices: { 1: 9, 3: 24, 6: 45, 12: 84 },
            extraConnRates: { 1: 3, 3: 8, 6: 15, 12: 30 },
            addOns: [{ id: 'iptv_adult', name: 'Adult' }, { id: 'iptv_247', name: '24/7' }, { id: 'iptv_bw', name: 'Low BW' }]
        },
        'B': {
            basePrices: { 1: 8, 3: 21, 6: 39, 12: 72 },
            extraConnRates: { 1: 2.5, 3: 7, 6: 15, 12: 30 },
            addOns: [{ id: 'vod_247', name: '24/7' }, { id: 'vod_adult', name: 'Adult' }]
        }
    };

    function renderConnectionSelectors() {
        connectionInputsContainer.innerHTML = '';
        if (selectedProduct === 'C') {
            createSlider('IPTV Connections', (val) => { iptvConnections = val; calculatePrice(); }, iptvConnections);
            createSlider('VOD Connections', (val) => { vodConnections = val; calculatePrice(); }, vodConnections);
        } else {
            const label = selectedProduct === 'A' ? 'IPTV Connections' : 'VOD Connections';
            createSlider(label, (val) => { 
                iptvConnections = val; 
                vodConnections = val; 
                calculatePrice(); 
            }, (selectedProduct === 'A' ? iptvConnections : vodConnections));
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
            <input type="range" min="1" max="5" value="${startVal}">
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
        addOnsGroup.innerHTML = '';
        selectedAddOns.clear();
        const productForAddons = (selectedProduct === 'C') ? 'A' : selectedProduct;

        if (!productForAddons) {
            noAddOnsMessage.style.display = 'block';
            return;
        }

        noAddOnsMessage.style.display = 'none';
        pricing[productForAddons].addOns.forEach(addOn => {
            const div = document.createElement('div');
            div.classList.add('add-on-checkbox');
            div.innerHTML = `
                <input type="checkbox" id="addon_${addOn.id}" data-addon-id="${addOn.id}">
                <span class="checkmark"></span>
                <label for="addon_${addOn.id}">${addOn.name}</label>
            `;
            addOnsGroup.appendChild(div);
            div.querySelector('input').onchange = (e) => {
                if (e.target.checked) selectedAddOns.add(e.target.dataset.addonId);
                else selectedAddOns.delete(e.target.dataset.addonId);
                calculatePrice();
            };
        });
        calculatePrice();
    }

    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths) return;
        let total = 0;

        if (selectedProduct === 'A' || selectedProduct === 'C') {
            const iptvBase = pricing['A'].basePrices[selectedDurationMonths];
            const iptvExtra = (iptvConnections - 1) * pricing['A'].extraConnRates[selectedDurationMonths];
            const iptvAddons = selectedAddOns.size * ADDON_RATE * iptvConnections * selectedDurationMonths;
            total += (iptvBase + iptvExtra + iptvAddons);
        }

        if (selectedProduct === 'B' || selectedProduct === 'C') {
            const vodBase = pricing['B'].basePrices[selectedDurationMonths];
            const vodExtra = (vodConnections - 1) * pricing['B'].extraConnRates[selectedDurationMonths];
            if (selectedProduct === 'B') {
                const vodAddons = selectedAddOns.size * ADDON_RATE * vodConnections * selectedDurationMonths;
                total += vodAddons;
            }
            total += (vodBase + vodExtra);
        }
        displayPriceSpan.textContent = `$${total.toFixed(2)}`;
    }

    resetButton.onclick = () => {
        productOptions.querySelector('[data-product="A"]').click();
        durationOptions.querySelector('[data-duration="1"]').click();
    };

    productOptions.onclick = (e) => {
        const btn = e.target.closest('.option-button');
        if (btn) {
            selectedProduct = btn.dataset.product;
            Array.from(productOptions.children).forEach(b => b.classList.toggle('selected', b === btn));
            renderConnectionSelectors();
            renderAddOns();
        }
    };

    durationOptions.onclick = (e) => {
        const btn = e.target.closest('.option-button');
        if (btn) {
            selectedDurationMonths = parseInt(btn.dataset.duration);
            Array.from(durationOptions.children).forEach(b => b.classList.toggle('selected', b === btn));
            renderAddOns();
        }
    };

    // Initialize
    resetButton.click();
});