document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionInputsContainer = document.getElementById('connectionInputsContainer');
    const displayPriceSpan = document.getElementById('displayPrice');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const resetButton = document.getElementById('resetButton');

    let selectedProduct = 'A';
    let selectedDurationMonths = 1;
    let iptvConnections = 1;
    let vodConnections = 1;
    let selectedAddOns = new Set(); 

    const ADDON_RATE = 0.50; // $0.50 per connection per month

    const pricing = {
        'A': {
            basePrices: { 1: 9, 3: 24, 6: 45, 12: 84 }, // [cite: 2, 43, 84, 125]
            extraConnRates: { 1: 3, 3: 8, 6: 15, 12: 30 }, // [cite: 10, 51, 92, 133]
            addOns: [{ id: 'a1', name: 'Adult' }, { id: 'a2', name: '24/7' }, { id: 'a3', name: 'Low BW' }]
        },
        'B': {
            basePrices: { 1: 8, 3: 21, 6: 39, 12: 72 }, // [cite: 167, 188, 209, 230]
            extraConnRates: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, // [cite: 171, 192, 213, 234]
            addOns: [{ id: 'b1', name: '24/7' }, { id: 'b2', name: 'Adult' }]
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
            createSlider(label, (val) => { iptvConnections = val; vodConnections = val; calculatePrice(); }, currentVal);
        }
    }

    function createSlider(labelText, onInput, startVal) {
        const div = document.createElement('div');
        div.className = 'users-input-group-wrapper';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <label>${labelText}</label>
                <span>${startVal}</span>
            </div>
            <input type="range" min="1" max="5" value="${startVal}">
        `;
        const slider = div.querySelector('input');
        const display = div.querySelector('span');
        slider.oninput = (e) => {
            display.textContent = e.target.value;
            onInput(parseInt(e.target.value));
        };
        connectionInputsContainer.appendChild(div);
    }

    function renderAddOns() {
        addOnsGroup.innerHTML = '';
        selectedAddOns.clear();
        const prod = (selectedProduct === 'C') ? 'A' : selectedProduct;
        if (!prod) return;

        pricing[prod].addOns.forEach(addOn => {
            const div = document.createElement('div');
            div.innerHTML = `<label><input type="checkbox" data-id="${addOn.id}"> ${addOn.name}</label>`;
            addOnsGroup.appendChild(div);
            div.querySelector('input').onchange = (e) => {
                if (e.target.checked) selectedAddOns.add(e.target.dataset.id);
                else selectedAddOns.delete(e.target.dataset.id);
                calculatePrice();
            };
        });
        calculatePrice();
    }

    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths) return;
        let total = 0;

        if (selectedProduct === 'A' || selectedProduct === 'C') {
            const base = pricing['A'].basePrices[selectedDurationMonths];
            const extra = (iptvConnections - 1) * pricing['A'].extraConnRates[selectedDurationMonths];
            const addons = selectedAddOns.size * ADDON_RATE * iptvConnections * selectedDurationMonths;
            total += (base + extra + addons);
        }

        if (selectedProduct === 'B' || selectedProduct === 'C') {
            const base = pricing['B'].basePrices[selectedDurationMonths];
            const extra = (vodConnections - 1) * pricing['B'].extraConnRates[selectedDurationMonths];
            if (selectedProduct === 'B') {
                const addons = selectedAddOns.size * ADDON_RATE * vodConnections * selectedDurationMonths;
                total += addons;
            }
            total += (base + extra);
        }
        displayPriceSpan.textContent = `$${total.toFixed(2)}`;
    }

    resetButton.onclick = () => {
        iptvConnections = 1; vodConnections = 1;
        selectedAddOns.clear(); selectedProduct = 'A'; selectedDurationMonths = 1;
        updateUI();
    };

    function updateUI() {
        Array.from(productOptions.children).forEach(b => b.classList.toggle('selected', b.dataset.product === selectedProduct));
        Array.from(durationOptions.children).forEach(b => b.classList.toggle('selected', b.dataset.duration === String(selectedDurationMonths)));
        renderConnectionSelectors();
        renderAddOns();
    }

    productOptions.onclick = (e) => { if (e.target.dataset.product) { selectedProduct = e.target.dataset.product; updateUI(); } };
    durationOptions.onclick = (e) => { if (e.target.dataset.duration) { selectedDurationMonths = parseInt(e.target.dataset.duration); updateUI(); } };

    updateUI();
});