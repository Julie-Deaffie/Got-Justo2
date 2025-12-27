```javascript
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const numUsersInput = document.getElementById('numUsers');
    const usersSlider = document.getElementById('usersSlider');
    const usersDisplay = document.getElementById('usersDisplay');
    const decrementUsersButton = document.getElementById('decrementUsers');
    const incrementUsersButton = document.getElementById('incrementUsers');
    const calculatePriceButton = document.getElementById('calculatePriceButton'); // Still useful for manual trigger
    const displayPriceSpan = document.getElementById('displayPrice');
    const viewFullPricelistLink = document.getElementById('viewFullPricelistLink');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const noAddOnsMessage = document.querySelector('.no-add-ons-message'); // New element

    // --- State Variables ---
    let selectedProduct = null;
    let selectedDurationMonths = null;
    let numUsers = parseInt(numUsersInput.value);
    let selectedAddOns = new Set(); // Stores IDs of selected add-ons

    // --- Pricing Data ---
    const ADDITIONAL_USER_COST_PER_MONTH = 0.50; // 50 cents
    const ADDON_COST_PER_USER_PER_MONTH = 0.50; // 50 cents

    const pricing = {
        'A': {
            // Base total price for 1 user for the specified duration
            basePrices: {
                1: 9,   // 1 month: $9 total
                3: 24,  // 3 months: $24 total
                6: 45,  // 6 months: $45 total
                12: 84  // 12 months: $84 total
            },
            addOns: [
                { id: 'a_addon1', name: 'Product A Exclusive Add-on' }, // Exclusive to A
                { id: 'common_addon1', name: 'Common Add-on 1' },
                { id: 'common_addon2', name: 'Common Add-on 2' }
            ]
        },
        'B': {
            // Base total price for 1 user for the specified duration
            basePrices: {
                1: 8,   // 1 month: $8 total
                3: 21,  // 3 months: $21 total
                6: 39,  // 6 months: $39 total
                12: 72  // 12 months: $72 total
            },
            addOns: [
                { id: 'common_addon1', name: 'Common Add-on 1' },
                { id: 'common_addon2', name: 'Common Add-on 2' }
            ]
        },
        'C': {
            // Product C prices are derived from A + B. No specific add-ons for C.
            // basePrices will be calculated dynamically for C.
            addOns: [] // No add-ons for Product C directly
        }
    };

    // --- Helper Functions ---

    // Updates the visual selection state of buttons
    function updateSelection(groupElement, selectedValue, attributeName) {
        Array.from(groupElement.children).forEach(button => {
            if (button.dataset[attributeName] === String(selectedValue)) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    // Displays add-on options based on selected product
    function renderAddOns() {
        addOnsGroup.innerHTML = ''; // Clear previous add-ons
        selectedAddOns.clear(); // Clear selected add-ons when product changes
        calculatePrice(); // Recalculate immediately with cleared add-ons

        if (!selectedProduct) {
            noAddOnsMessage.textContent = 'Select a product to see available add-ons.';
            noAddOnsMessage.style.display = 'block';
            return;
        }

        const productAddOns = pricing[selectedProduct].addOns;

        if (productAddOns.length === 0) {
            noAddOnsMessage.textContent = `No add-ons available for Product ${selectedProduct}.`;
            noAddOnsMessage.style.display = 'block';
            return;
        }

        noAddOnsMessage.style.display = 'none'; // Hide message if add-ons are available

        productAddOns.forEach(addOn => {
            const addOnDiv = document.createElement('div');
            addOnDiv.classList.add('add-on-checkbox');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `addon_${addOn.id}`;
            input.dataset.addonId = addOn.id;

            const label = document.createElement('label');
            label.htmlFor = `addon_${addOn.id}`;
            label.textContent = `${addOn.name} ($${ADDON_COST_PER_USER_PER_MONTH.toFixed(2)}/user/month)`;

            const checkmark = document.createElement('span');
            checkmark.classList.add('checkmark');

            addOnDiv.appendChild(input);
            addOnDiv.appendChild(checkmark);
            addOnDiv.appendChild(label); // Label after checkmark for easier styling

            addOnsGroup.appendChild(addOnDiv);

            input.addEventListener('change', (event) => {
                if (event.target.checked) {
                    selectedAddOns.add(event.target.dataset.addonId);
                    addOnDiv.classList.add('selected'); // Visual feedback for the custom checkbox
                } else {
                    selectedAddOns.delete(event.target.dataset.addonId);
                    addOnDiv.classList.remove('selected');
                }
                calculatePrice();
            });
        });
    }
```

---

**Block 3: Helper Functions (`calculatePrice` and `displayFullPricelist`)**

```javascript
    // Main price calculation logic
    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths || numUsers < 1) {
            displayPriceSpan.textContent = '$0.00';
            return 0;
        }

        let totalBasePriceForOneUser = 0;

        // Calculate base price (per duration for 1 user)
        if (selectedProduct === 'C') {
            // Product C is sum of A and B for the same duration
            const priceA = pricing['A'].basePrices[selectedDurationMonths];
            const priceB = pricing['B'].basePrices[selectedDurationMonths];
            totalBasePriceForOneUser = priceA + priceB;
        } else {
            totalBasePriceForOneUser = pricing[selectedProduct].basePrices[selectedDurationMonths];
        }

        // Calculate additional user cost (for users beyond the first)
        let additionalUsersCost = 0;
        if (numUsers > 1) {
            const numAdditionalUsers = numUsers - 1;
            additionalUsersCost = numAdditionalUsers * ADDITIONAL_USER_COST_PER_MONTH * selectedDurationMonths;
        }

        // Calculate add-on costs
        let addOnsTotalCost = 0;
        if (selectedAddOns.size > 0 && selectedProduct !== 'C') { // C has no add-ons
            // Each selected add-on costs 50 cents per user per month
            addOnsTotalCost = selectedAddOns.size * ADDON_COST_PER_USER_PER_MONTH * numUsers * selectedDurationMonths;
        }

        let finalPrice = totalBasePriceForOneUser + additionalUsersCost + addOnsTotalCost;

        displayPriceSpan.textContent = `$${finalPrice.toFixed(2)}`;
        return finalPrice;
    }

    // Function to generate and display the full pricelist
    function displayFullPricelist() {
        let pricelistContent = `
            <h3>Full Pricelist</h3>
            <p style="font-size: 0.8em; color: #aaa; margin-bottom: 20px; text-shadow: none;">
                Prices are total for duration, for 1 user.<br>
                Additional users: +$${ADDITIONAL_USER_COST_PER_MONTH.toFixed(2)}/user/month.<br>
                Add-ons: +$${ADDON_COST_PER_USER_PER_MONTH.toFixed(2)}/addon/user/month.
            </p>
            <table class="pricelist-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Duration</th>
                        <th>1 User Price</th>
                        <th>Available Add-ons</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const durations = [1, 3, 6, 12];
        const addOnNamesMap = {
            'a_addon1': 'A Exclusive',
            'common_addon1': 'Common 1',
            'common_addon2': 'Common 2'
        };

        durations.forEach(duration => {
            ['A', 'B', 'C'].forEach(productKey => {
                let oneUserPrice = 0;
                let availableAddOnsDisplay = 'None';

                if (productKey === 'C') {
                    const priceA = pricing['A'].basePrices[duration];
                    const priceB = pricing['B'].basePrices[duration];
                    oneUserPrice = priceA + priceB;
                } else {
                    oneUserPrice = pricing[productKey].basePrices[duration];
                }

                if (pricing[productKey].addOns && pricing[productKey].addOns.length > 0) {
                    availableAddOnsDisplay = pricing[productKey].addOns
                        .map(ao => addOnNamesMap[ao.id] || ao.name) // Use mapped name or default
                        .join(', ');
                }

                pricelistContent += `
                    <tr>
                        <td>${productKey}</td>
                        <td>${duration} Month(s)</td>
                        <td>$${oneUserPrice.toFixed(2)}</td>
                        <td>${availableAddOnsDisplay}</td>
                    </tr>
                `;
            });
        });
        pricelistContent += '</tbody></table>';


        // Create a simple modal for the pricelist display
        const modalId = 'pricelistModal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.classList.add('modal-overlay'); // Styling for overlay
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    ${pricelistContent}
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.close-button').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Close when clicking outside the modal content
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        } else {
            // If modal already exists, update its content (e.g., if pricing changes, though unlikely for static pricelist)
            modal.querySelector('.modal-content').innerHTML = `<span class="close-button">&times;</span>${pricelistContent}`;
             modal.querySelector('.close-button').addEventListener('click', () => {
                modal.style.display = 'none';
            });
             modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        modal.style.display = 'flex'; // Show the modal
    }
```

---

**Block 4: Event Listeners and Initial Setup**

```javascript
    // --- Event Listeners ---

    // Product Selection
    productOptions.addEventListener('click', (event) => {
        const button = event.target.closest('.option-button');
        if (button && button.dataset.product) {
            selectedProduct = button.dataset.product;
            updateSelection(productOptions, selectedProduct, 'product');
            renderAddOns(); // Re-render add-ons for the new product
            calculatePrice();
        }
    });

    // Duration Selection
    durationOptions.addEventListener('click', (event) => {
        const button = event.target.closest('.option-button');
        if (button && button.dataset.duration) {
            selectedDurationMonths = parseInt(button.dataset.duration);
            updateSelection(durationOptions, selectedDurationMonths, 'duration');
            calculatePrice();
        }
    });

    // User Count Input
    numUsersInput.addEventListener('input', () => {
        numUsers = parseInt(numUsersInput.value);
        if (isNaN(numUsers) || numUsers < 1) {
            numUsers = 1;
            numUsersInput.value = 1;
        } else if (numUsers > 5) { // Enforce max 5 users
            numUsers = 5;
            numUsersInput.value = 5;
        }
        usersSlider.value = numUsers;
        usersDisplay.textContent = `${numUsers} User(s)`;
        calculatePrice();
    });

    // User Count Slider
    usersSlider.addEventListener('input', () => {
        numUsers = parseInt(usersSlider.value);
        numUsersInput.value = numUsers;
        usersDisplay.textContent = `${numUsers} User(s)`;
        calculatePrice();
    });

    // Decrement Users Button
    decrementUsersButton.addEventListener('click', () => {
        if (numUsers > 1) {
            numUsers--;
            numUsersInput.value = numUsers;
            usersSlider.value = numUsers;
            usersDisplay.textContent = `${numUsers} User(s)`;
            calculatePrice();
        }
    });

    // Increment Users Button
    incrementUsersButton.addEventListener('click', () => {
        if (numUsers < 5) { // Enforce max 5 users
            numUsers++;
            numUsersInput.value = numUsers;
            usersSlider.value = numUsers;
            usersDisplay.textContent = `${numUsers} User(s)`;
            calculatePrice();
        }
    });

    // Calculate Price Button (can be removed if you prefer continuous updates, but harmless)
    calculatePriceButton.addEventListener('click', calculatePrice);

    // View Full Pricelist Link
    viewFullPricelistLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayFullPricelist();
    });

    // --- Initial Setup ---
    usersDisplay.textContent = `${numUsers} User(s)`;
    displayPriceSpan.textContent = '$0.00';
    renderAddOns(); // Initial render for add-ons (will show "select a product" message)

    // Optional: Pre-select first options for demo purposes
    // productOptions.children[0].click(); // Select Product A
    // durationOptions.children[0].click(); // Select 1 Month
});
```
