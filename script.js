document.addEventListener('DOMContentLoaded', () => {
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const connectionContainer = document.getElementById('connectionContainer');
    const addOnsGroupContainer = document.getElementById('addOnsGroupContainer');
    const addOnsGroup = document.getElementById('addOnsGroupInner');
    const displayPriceSpan = document.getElementById('displayPrice');
    const summaryDisplay = document.getElementById('summaryDisplay');
    const resetButton = document.getElementById('resetButton');

    let state = { 
        product: 'A', 
        duration: 1, 
        iptv: 1, 
        vod: 1, 
        addons: new Set() 
    };
    
    const ADDON_RATE = 0.50;

    const pricing = {
        'A': { 
            base: { 1: 9, 3: 24, 6: 45, 12: 84 }, 
            extra: { 1: 3, 3: 8, 6: 15, 12: 30 }, 
            name: "IPTV", 
            addons: [
                {id:'a1', name:'ADULT'}, 
                {id:'a2', name:'BW'}, 
                {id:'a3', name:'24/7'}
            ] 
        },
        'B': { 
            base: { 1: 8, 3: 21, 6: 39, 12: 72 }, 
            extra: { 1: 2.5, 3: 7, 6: 15, 12: 30 }, 
            name: "VOD", 
            addons: [
                {id:'b1', name:'ADULT'}, 
                {id:'b2', name:'24/7'}
            ] 
        },
        'C': { 
            name: "IPTV & VOD" 
        }
    };

    // Animation helper
    function animateValue(element, start, end, duration = 500) {
        const startTime = performance.now();
        const difference = end - start;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (difference * easeOut);
            
            element.textContent = current.toFixed(2);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end.toFixed(2);
            }
        }
        
        requestAnimationFrame(update);
    }

    function calculate() {
        let total = 0;
        let summaryText = "";
        
        // Calculate pricing
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
            if (state.product === 'B') {
                total += state.addons.size * ADDON_RATE * state.vod * state.duration;
            }
            summaryText += `${state.vod}x VOD Node(s)`;
        }

        // Animate price update
        const currentPrice = parseFloat(displayPriceSpan.textContent) || 0;
        animateValue(displayPriceSpan, currentPrice, total);
        
        // Update summary
        const addonList = Array.from(state.addons).map(id => {
            const allAddons = [...pricing.A.addons, ...pricing.B.addons];
            return allAddons.find(a => a.id === id)?.name;
        }).filter(Boolean).join(", ");

        summaryDisplay.innerHTML = `
            <div class="summary-line">${state.duration} ${state.duration === 1 ? 'Month' : 'Months'} ${pricing[state.product].name}</div>
            <div class="summary-line">${summaryText}</div>
            <div class="summary-addons">${addonList ? "+ " + addonList : "No Add-ons Selected"}</div>
        `;
    }

    function renderConnections() {
        // Clear only dynamically generated content, keep the label
        let connectionItemsContainer = connectionContainer.querySelector('.connection-items-wrapper');
        if (!connectionItemsContainer) {
            connectionItemsContainer = document.createElement('div');
            connectionItemsContainer.className = 'connection-items-wrapper';
            connectionContainer.appendChild(connectionItemsContainer);
        }
        connectionItemsContainer.innerHTML = '';
        
        if (state.product === 'A' || state.product === 'C') {
            const item = document.createElement('div');
            item.className = 'connection-item';
            item.style.animationDelay = '0.1s';
            item.innerHTML = `
                <span>IPTV Connections</span>
                <div class="connection-controls">
                    <button class="control-btn" data-action="iptv-decrease">−</button>
                    <span class="control-value">${state.iptv}</span>
                    <button class="control-btn" data-action="iptv-increase">+</button>
                </div>
            `;
            connectionContainer.appendChild(item);
            
            item.querySelector('[data-action="iptv-decrease"]').addEventListener('click', () => {
                if (state.iptv > 1) {
                    state.iptv--;
                    renderConnections();
                    calculate();
                }
            });
            
            item.querySelector('[data-action="iptv-increase"]').addEventListener('click', () => {
                state.iptv++;
                renderConnections();
                calculate();
            });
        }

        if (state.product === 'B' || state.product === 'C') {
            const item = document.createElement('div');
            item.className = 'connection-item';
            item.style.animationDelay = '0.2s';
            item.innerHTML = `
                <span>VOD Connections</span>
                <div class="connection-controls">
                    <button class="control-btn" data-action="vod-decrease">−</button>
                    <span class="control-value">${state.vod}</span>
                    <button class="control-btn" data-action="vod-increase">+</button>
                </div>
            `;
            connectionContainer.appendChild(item);
            
            item.querySelector('[data-action="vod-decrease"]').addEventListener('click', () => {
                if (state.vod > 1) {
                    state.vod--;
                    renderConnections();
                    calculate();
                }
            });
            
            item.querySelector('[data-action="vod-increase"]').addEventListener('click', () => {
                state.vod++;
                renderConnections();
                calculate();
            });
        }
    }

    function renderAddons() {
        addOnsGroup.innerHTML = '';
        
        let currentAddons = [];
        if (state.product === 'A') {
            currentAddons = pricing.A.addons || [];
        } else if (state.product === 'B') {
            currentAddons = pricing.B.addons || [];
        } else if (state.product === 'C') {
            // For bundle, combine both but filter duplicates
            const allAddons = [...(pricing.A.addons || []), ...(pricing.B.addons || [])];
            // Remove duplicates by id
            const seen = new Set();
            currentAddons = allAddons.filter(addon => {
                if (seen.has(addon.id)) return false;
                seen.add(addon.id);
                return true;
            });
        }
        
        if (currentAddons.length === 0) {
            addOnsGroup.style.display = 'none';
            return;
        }
        
        addOnsGroup.style.display = 'flex';
        
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = '// Add-ons';
        addOnsGroupContainer.appendChild(label);
        
        currentAddons.forEach((addon, index) => {
            const item = document.createElement('div');
            item.className = 'addon-item';
            item.style.animationDelay = `${0.1 * (index + 1)}s`;
            item.style.opacity = '0';
            item.style.animation = 'slideIn 0.4s ease-out forwards';
            
            const labelSpan = document.createElement('span');
            labelSpan.textContent = addon.name;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'addon-checkbox';
            checkbox.dataset.addon = addon.id;
            checkbox.checked = state.addons.has(addon.id);
            
            item.appendChild(labelSpan);
            item.appendChild(checkbox);
            addOnsGroup.appendChild(item);
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    state.addons.add(addon.id);
                } else {
                    state.addons.delete(addon.id);
                }
                calculate();
            });
        });
    }

    function resetCalculator() {
        state = { product: 'A', duration: 1, iptv: 1, vod: 1, addons: new Set() };
        
        // Reset UI buttons
        document.querySelectorAll('.btn-cyber').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Trigger initial selections
        document.querySelector('[data-product="A"]').click();
        document.querySelector('[data-duration="1"]').click();
    }

    // Product selection
    productOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-cyber[data-product]');
        if (!btn) return;
        
        const product = btn.dataset.product;
        state.product = product;
        
        // Update active state
        productOptions.querySelectorAll('.btn-cyber').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Reset connections and addons when product changes
        state.iptv = 1;
        state.vod = 1;
        state.addons.clear();
        
        renderConnections();
        renderAddons();
        calculate();
    });

    // Duration selection
    durationOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-cyber[data-duration]');
        if (!btn) return;
        
        const duration = parseInt(btn.dataset.duration);
        state.duration = duration;
        
        // Update active state
        durationOptions.querySelectorAll('.btn-cyber').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        calculate();
    });

    // Reset button
    resetButton.addEventListener('click', resetCalculator);

    // Initial render with staggered animations
    setTimeout(() => {
        resetCalculator();
    }, 100);
});
