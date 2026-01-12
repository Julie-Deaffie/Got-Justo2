document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionContainer = document.getElementById('connectionContainer');
    const displayPriceSpan = document.getElementById('displayPrice');
document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionContainer = document.getElementById('connectionContainer');
    const displayPriceSpan = document.getElementById('displayPrice');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const resetButton = document.getElementById('resetButton');

    let state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() };
    const ADDON_RATE = 0.50; // $0.50 per connection per month [cite: 1]

    const pricing = {
        'A': { 
            base: { 1: 9, 3: 24, 6: 45, 12: 84 }, // [cite: 2, 43, 84, 125]
            extra: { 1: 3, 3: 8, 6: 15, 12: 30 }, // [cite: 10, 51, 92, 133]
            addons: [
                {id:'iptv_a', name:'ADULT'}, 
                {id:'iptv_bw', name:'LOW-BANDWIDTH'}, 
                {id:'iptv_24', name:'24/7 CHANNELS'}
            ]
        },
        'B': { 
            base: { 1: 8, 3: 21, 6: 39, 12: 72 }, // [cite: 167, 188, 209, 230]
            extra: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, // [cite: 171, 192, 213, 234]
            addons: [
                {id:'vod_a', name:'ADULT'}, 
                {id:'vod_24', name:'24/7 CHANNELS'}
            ]
        }
    };

    function renderConnections() {
        connectionContainer.innerHTML = '';
        if (state.product === 'C' || state.product === 'A') {
            createConnBox('LIVE IPTV', 'iptv', state.iptv);
        }
        if (state.product === 'C' || state.product === 'B') {
            createConnBox('VIDEO ON DEMAND', 'vod', state.vod);
        }
    }

    function createConnBox(title, key, currentVal) {
        const div = document.createElement('div');
        div.className = 'conn-group';
        div.innerHTML = `<span class="conn-label">${title}</span><div class="bubble-row"></div>`;
        const row = div.querySelector('.bubble-row');
        [1,2,3,4,5].forEach(num => {
            const b = document.createElement('div');
            b.className = `bubble ${num === currentVal ? 'selected' : ''}`;
            b.innerText = num;
            b.onclick = () => { state[key] = num; renderConnections(); calculate(); };
            row.appendChild(b);
        });
        connectionContainer.appendChild(div);
    }

    function renderAddons() {
        addOnsGroup.innerHTML = '';
        state.addons.clear();
        const prod = state.product === 'C' ? 'A' : state.product;
        
        pricing[prod].addons.forEach(ao => {
            const btn = document.createElement('button');
            btn.className = 'btn-cyber-pill'; 
            btn.innerText = ao.name;
            btn.onclick = () => {
                if (state.addons.has(ao.id)) state.addons.delete(ao.id);
                else state.addons.add(ao.id);
                btn.classList.toggle('selected');
                calculate();
            };
            addOnsGroup.appendChild(btn);
        });
        calculate();
    }

    function calculate() {
        if (!state.product || !state.duration) return;
        let total = 0;

        if (state.product === 'A' || state.product === 'C') {
            const p = pricing['A'];
            total += p.base[state.duration] + (state.iptv - 1) * p.extra[state.duration];
            total += state.addons.size * ADDON_RATE * state.iptv * state.duration;
        }

        if (state.product === 'B' || state.product === 'C') {
            const p = pricing['B'];
            total += p.base[state.duration] + (state.vod - 1) * p.extra[state.duration];
            if (state.product === 'B') {
                total += state.addons.size * ADDON_RATE * state.vod * state.duration;
            }
        }
        displayPriceSpan.innerText = total.toFixed(2);
    }

    function init() {
        Array.from(productOptions.children).forEach(b => b.onclick = () => {
            state.product = b.dataset.product;
            Array.from(productOptions.children).forEach(x => x.classList.toggle('selected', x === b));
            renderConnections(); renderAddons();
        });
        Array.from(durationOptions.children).forEach(b => b.onclick = () => {
            state.duration = parseInt(b.dataset.duration);
            Array.from(durationOptions.children).forEach(x => x.classList.toggle('selected', x === b));
            renderAddons();
        });
        resetButton.onclick = () => { 
            state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() }; 
            init(); 
        };
        productOptions.querySelector('[data-product="A"]').click();
        durationOptions.querySelector('[data-duration="1"]').click();
    }
    init();
});    const resetButton = document.getElementById('resetButton');

    let state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() };
    const ADDON_RATE = 0.50; // $0.50 per connection per month [cite: 1]

    const pricing = {
        'A': { 
            base: { 1: 9, 3: 24, 6: 45, 12: 84 }, // [cite: 2, 43, 84, 125]
            extra: { 1: 3, 3: 8, 6: 15, 12: 30 }, // [cite: 10, 51, 92, 133]
            addons: [
                {id:'iptv_a', name:'ADULT'}, 
                {id:'iptv_bw', name:'LOW-BANDWIDTH'}, 
                {id:'iptv_24', name:'24/7 CHANNELS'}
            ]
        },
        'B': { 
            base: { 1: 8, 3: 21, 6: 39, 12: 72 }, // [cite: 167, 188, 209, 230]
            extra: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, // [cite: 171, 192, 213, 234]
            addons: [
                {id:'vod_a', name:'ADULT'}, 
                {id:'vod_24', name:'24/7 CHANNELS'}
            ]
        }
    };

    function renderConnections() {
        connectionContainer.innerHTML = '';
        if (state.product === 'C' || state.product === 'A') {
            createConnBox('LIVE IPTV', 'iptv', state.iptv);
        }
        if (state.product === 'C' || state.product === 'B') {
            createConnBox('VIDEO ON DEMAND', 'vod', state.vod);
        }
    }

    function createConnBox(title, key, currentVal) {
        const div = document.createElement('div');
        div.className = 'conn-group';
        div.innerHTML = `<span class="conn-label">${title}</span><div class="bubble-row"></div>`;
        const row = div.querySelector('.bubble-row');
        [1,2,3,4,5].forEach(num => {
            const b = document.createElement('div');
            b.className = `bubble ${num === currentVal ? 'selected' : ''}`;
            b.innerText = num;
            b.onclick = () => { state[key] = num; renderConnections(); calculate(); };
            row.appendChild(b);
        });
        connectionContainer.appendChild(div);
    }

    function renderAddons() {
        addOnsGroup.innerHTML = '';
        state.addons.clear();
        const prod = state.product === 'C' ? 'A' : state.product;
        
        pricing[prod].addons.forEach(ao => {
            const btn = document.createElement('button');
            btn.className = 'btn-cyber-pill'; 
            btn.innerText = ao.name;
            btn.onclick = () => {
                if (state.addons.has(ao.id)) state.addons.delete(ao.id);
                else state.addons.add(ao.id);
                btn.classList.toggle('selected');
                calculate();
            };
            addOnsGroup.appendChild(btn);
        });
        calculate();
    }

    function calculate() {
        if (!state.product || !state.duration) return;
        let total = 0;

        if (state.product === 'A' || state.product === 'C') {
            const p = pricing['A'];
            total += p.base[state.duration] + (state.iptv - 1) * p.extra[state.duration];
            total += state.addons.size * ADDON_RATE * state.iptv * state.duration;
        }

        if (state.product === 'B' || state.product === 'C') {
            const p = pricing['B'];
            total += p.base[state.duration] + (state.vod - 1) * p.extra[state.duration];
            if (state.product === 'B') {
                total += state.addons.size * ADDON_RATE * state.vod * state.duration;
            }
        }
        displayPriceSpan.innerText = total.toFixed(2);
    }

    function init() {
        Array.from(productOptions.children).forEach(b => b.onclick = () => {
            state.product = b.dataset.product;
            Array.from(productOptions.children).forEach(x => x.classList.toggle('selected', x === b));
            renderConnections(); renderAddons();
        });
        Array.from(durationOptions.children).forEach(b => b.onclick = () => {
            state.duration = parseInt(b.dataset.duration);
            Array.from(durationOptions.children).forEach(x => x.classList.toggle('selected', x === b));
            renderAddons();
        });
        resetButton.onclick = () => { 
            state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() }; 
            init(); 
        };
        productOptions.querySelector('[data-product="A"]').click();
        durationOptions.querySelector('[data-duration="1"]').click();
    }
    init();
});
