document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const numUsersInput = document.getElementById('numUsers');
    const usersSlider = document.getElementById('usersSlider');
    const usersDisplay = document.getElementById('usersDisplay');
    const decrementUsersButton = document.getElementById('decrementUsers');
    const incrementUsersButton = document.getElementById('incrementUsers');
    const displayPriceSpan = document.getElementById('displayPrice');
    const viewFullPricelistLink = document.getElementById('viewFullPricelistLink');
    const addOnsGroup = document.getElementById('addOnsGroup');
    const noAddOnsMessage = document.querySelector('.no-add-ons-message');

    // --- State Variables ---
    let selectedProduct = null;
    let selectedDurationMonths = null;
    let numUsers = parseInt(numUsersInput.value);
    let selectedAddOns = new Set(); // Stores IDs of selected add-ons

    // --- Pricing Data ---
    const ADDON_COST_PER_USER_PER_MONTH = 0.50; // Add-ons are still 50 cents per user per month

    const pricing = {
        'A': {
            basePrices: {
                1: 9,
                3: 24,
                6: 45,
                12: 84
            },
            additionalUserCostPerDuration: {
                1: 3.00,
                3: 8.00,
                6: 15.00,
                12: 30.00
            },
            addOns: [
                { id: 'adult', name: 'Adult', sharedWith: 'B' },
                { id: '247', name: '24/7', sharedWith: 'B' },
                { id: 'lowbw', name: 'Low BW', sharedWith: null } // Only available from A
            ]
        },
        'B': {
            basePrices: {
                1: 8,
                3: 21,
                6: 39,
                12: 72
            },
            additionalUserCostPerDuration: {
                 1: (1 * 0.50),
                 3: (3 * 0.50),
                 6: (6 * 0.50),
                 12: (12 * 0.50)
            },
            addOns: [
                { id: 'adult', name: 'Adult', sharedWith: 'A' },
                { id: '247', name: '24/7', sharedWith: 'A' }
            ]
        },
        'C': {
            // Product C prices are derived from A + B
            // For Option C, add-ons come from both A and B with mutual exclusion
            addOns: [] // Will be rendered specially for C
        }
    };

    // --- Helper Functions ---

    function updateSelection(groupElement, selectedValue, attributeName) {
        Array.from(groupElement.children).forEach(button => {
            if (button.dataset[attributeName] === String(selectedValue)) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    // Update the disabled state of add-ons for Option C based on selections
    function updateOptionCAddOnStates() {
        if (selectedProduct !== 'C') return;

        // Get selected add-ons from each source
        const selectedFromA = new Set();
        const selectedFromB = new Set();

        selectedAddOns.forEach(addonId => {
            if (addonId.startsWith('a_')) {
                selectedFromA.add(addonId.replace('a_', ''));
            } else if (addonId.startsWith('b_')) {
                selectedFromB.add(addonId.replace('b_', ''));
            }
        });

        // Update all checkboxes in Option C
        const allCheckboxes = addOnsGroup.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            const addonId = checkbox.dataset.addonId;
            const baseId = addonId.replace('a_', '').replace('b_', '');
            const source = addonId.startsWith('a_') ? 'A' : 'B';
            const addOnDiv = checkbox.closest('.add-on-checkbox');

            // Check if this add-on is shared and selected from the other source
            let shouldDisable = false;

            if (source === 'A' && selectedFromB.has(baseId)) {
                // This A add-on is disabled because it's selected from B
                shouldDisable = true;
            } else if (source === 'B' && selectedFromA.has(baseId)) {
                // This B add-on is disabled because it's selected from A
                shouldDisable = true;
            }

            checkbox.disabled = shouldDisable;
            if (shouldDisable) {
                addOnDiv.classList.add('disabled');
            } else {
                addOnDiv.classList.remove('disabled');
            }
        });
    }

    // Displays add-on options based on selected product
    function renderAddOns() {
        addOnsGroup.innerHTML = '';
        selectedAddOns.clear();
        calculatePrice();

        if (!selectedProduct) {
            noAddOnsMessage.textContent = 'Select a product to see available add-ons.';
            noAddOnsMessage.style.display = 'block';
            return;
        }

        if (!selectedDurationMonths) {
            noAddOnsMessage.textContent = 'Select a duration to see add-on prices.';
            noAddOnsMessage.style.display = 'block';
            return;
        }

        // Special rendering for Option C
        if (selectedProduct === 'C') {
            renderOptionCAddOns();
            return;
        }

        const productAddOns = pricing[selectedProduct].addOns;

        if (productAddOns.length === 0) {
            noAddOnsMessage.textContent = `No add-ons available for Product ${selectedProduct}.`;
            noAddOnsMessage.style.display = 'block';
            return;
        }

        noAddOnsMessage.style.display = 'none';

        productAddOns.forEach(addOn => {
            const addOnDiv = document.createElement('div');
            addOnDiv.classList.add('add-on-checkbox');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `addon_${addOn.id}`;
            input.dataset.addonId = addOn.id;

            const label = document.createElement('label');
            label.htmlFor = `addon_${addOn.id}`;
            label.textContent = `${addOn.name} ($${(ADDON_COST_PER_USER_PER_MONTH * selectedDurationMonths).toFixed(2)}/user for duration)`;

            const checkmark = document.createElement('span');
            checkmark.classList.add('checkmark');

            addOnDiv.appendChild(input);
            addOnDiv.appendChild(checkmark);
            addOnDiv.appendChild(label);

            addOnsGroup.appendChild(addOnDiv);

            input.addEventListener('change', (event) => {
                if (event.target.checked) {
                    selectedAddOns.add(event.target.dataset.addonId);
                    addOnDiv.classList.add('selected');
                } else {
                    selectedAddOns.delete(event.target.dataset.addonId);
                    addOnDiv.classList.remove('selected');
                }
                calculatePrice();
            });
        });
    }

    // Special rendering for Option C add-ons - simplified list format
    function renderOptionCAddOns() {
        noAddOnsMessage.style.display = 'none';

        // Define the 3 addons for Option C
        const optionCAddOns = [
            { id: 'adult', name: 'Adult' },
            { id: '247', name: '24/7' },
            { id: 'lowbw', name: 'Low BW' }
        ];

        // Create addon container
        const addonsContainer = document.createElement('div');
        addonsContainer.classList.add('addon-section');

        optionCAddOns.forEach((addOn, index) => {
            const addOnDiv = document.createElement('div');
            addOnDiv.classList.add('add-on-checkbox');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `addon_c_${addOn.id}`;
            input.dataset.addonId = `c_${addOn.id}`;
            input.dataset.baseAddonId = addOn.id;

            const label = document.createElement('label');
            label.htmlFor = `addon_c_${addOn.id}`;
            const priceForDuration = (ADDON_COST_PER_USER_PER_MONTH * selectedDurationMonths).toFixed(2);
            label.textContent = `Addon ${index + 1} ($${priceForDuration} for duration)`;

            const checkmark = document.createElement('span');
            checkmark.classList.add('checkmark');

            addOnDiv.appendChild(input);
            addOnDiv.appendChild(checkmark);
            addOnDiv.appendChild(label);

            addonsContainer.appendChild(addOnDiv);

            input.addEventListener('change', (event) => {
                if (event.target.checked) {
                    selectedAddOns.add(event.target.dataset.addonId);
                    addOnDiv.classList.add('selected');
                } else {
                    selectedAddOns.delete(event.target.dataset.addonId);
                    addOnDiv.classList.remove('selected');
                }
                calculatePrice();
            });
        });

        addOnsGroup.appendChild(addonsContainer);
    }

    function createAddOnCheckbox(addOn, prefix) {
        const addOnDiv = document.createElement('div');
        addOnDiv.classList.add('add-on-checkbox');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `addon_${prefix}${addOn.id}`;
        input.dataset.addonId = `${prefix}${addOn.id}`;
        input.dataset.baseAddonId = addOn.id;
        input.dataset.source = prefix === 'a_' ? 'A' : 'B';

        const label = document.createElement('label');
        label.htmlFor = `addon_${prefix}${addOn.id}`;
        label.textContent = `${addOn.name} ($${(ADDON_COST_PER_USER_PER_MONTH * selectedDurationMonths).toFixed(2)}/user for duration)`;

        const checkmark = document.createElement('span');
        checkmark.classList.add('checkmark');

        addOnDiv.appendChild(input);
        addOnDiv.appendChild(checkmark);
        addOnDiv.appendChild(label);

        input.addEventListener('change', (event) => {
            if (event.target.checked) {
                selectedAddOns.add(event.target.dataset.addonId);
                addOnDiv.classList.add('selected');
            } else {
                selectedAddOns.delete(event.target.dataset.addonId);
                addOnDiv.classList.remove('selected');
            }
            updateOptionCAddOnStates();
            calculatePrice();
        });

        return addOnDiv;
    }

    // Main price calculation logic
    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths || numUsers < 1) {
            displayPriceSpan.textContent = '$0.00';
            return 0;
        }

        let totalBasePriceForOneUser = 0;
        let additionalUserCostForDuration = 0;

        if (selectedProduct === 'C') {
            const priceA = pricing['A'].basePrices[selectedDurationMonths];
            const priceB = pricing['B'].basePrices[selectedDurationMonths];
            totalBasePriceForOneUser = priceA + priceB;

            additionalUserCostForDuration = pricing['A'].additionalUserCostPerDuration[selectedDurationMonths] +
                                            pricing['B'].additionalUserCostPerDuration[selectedDurationMonths];

        } else {
            totalBasePriceForOneUser = pricing[selectedProduct].basePrices[selectedDurationMonths];
            additionalUserCostForDuration = pricing[selectedProduct].additionalUserCostPerDuration[selectedDurationMonths];
        }

        let totalAdditionalUsersCost = 0;
        if (numUsers > 1) {
            const numAdditionalUsers = numUsers - 1;
            totalAdditionalUsersCost = numAdditionalUsers * additionalUserCostForDuration;
        }

        // Calculate add-on costs
        let addOnsTotalCost = 0;
        if (selectedAddOns.size > 0) {
            // For Option C, count unique add-ons (since some may be selected from A or B)
            // Each selected add-on costs 50 cents per user per month * total duration * total users
            addOnsTotalCost = selectedAddOns.size * ADDON_COST_PER_USER_PER_MONTH * numUsers * selectedDurationMonths;
        }

        let finalPrice = totalBasePriceForOneUser + totalAdditionalUsersCost + addOnsTotalCost;

        displayPriceSpan.textContent = `$${finalPrice.toFixed(2)}`;
        return finalPrice;
    }

    // Function to generate and display the full pricelist
    function displayFullPricelist() {
        let pricelistContent = `
            <h3>Full Pricelist</h3>
            <p style="font-size: 0.8em; color: #aaa; margin-bottom: 20px; text-shadow: none;">
                Prices are total for duration, for 1 user.<br>
                Additional User Cost: Calculated per duration based on product.<br>
                Add-ons: +$${ADDON_COST_PER_USER_PER_MONTH.toFixed(2)}/addon/user/month.
            </p>
            <table class="pricelist-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Duration</th>
                        <th>1 User Price</th>
                        <th>Add'l User Cost (per duration)</th>
                        <th>Available Add-ons</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const durations = [1, 3, 6, 12];

        durations.forEach(duration => {
            ['A', 'B', 'C'].forEach(productKey => {
                let oneUserPrice = 0;
                let addlUserCostDisplay = 0;
                let availableAddOnsDisplay = 'None';

                if (productKey === 'C') {
                    const priceA = pricing['A'].basePrices[duration];
                    const priceB = pricing['B'].basePrices[duration];
                    oneUserPrice = priceA + priceB;

                    addlUserCostDisplay = pricing['A'].additionalUserCostPerDuration[duration] +
                                          pricing['B'].additionalUserCostPerDuration[duration];
                    availableAddOnsDisplay = 'From A: Adult, 24/7, Low BW | From B: Adult, 24/7 (mutually exclusive)';
                } else {
                    oneUserPrice = pricing[productKey].basePrices[duration];
                    addlUserCostDisplay = pricing[productKey].additionalUserCostPerDuration[duration];

                    if (pricing[productKey].addOns && pricing[productKey].addOns.length > 0) {
                        availableAddOnsDisplay = pricing[productKey].addOns.map(ao => ao.name).join(', ');
                    }
                }

                pricelistContent += `
                    <tr>
                        <td>${productKey}</td>
                        <td>${duration} Month(s)</td>
                        <td>$${oneUserPrice.toFixed(2)}</td>
                        <td>$${addlUserCostDisplay.toFixed(2)}</td>
                        <td>${availableAddOnsDisplay}</td>
                    </tr>
                `;
            });
        });
        pricelistContent += '</tbody></table>';

        const modalId = 'pricelistModal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.classList.add('modal-overlay');
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

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        } else {
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

        modal.style.display = 'flex';
    }

    // --- Event Listeners ---
    productOptions.addEventListener('click', (event) => {
        const button = event.target.closest('.option-button');
        if (button && button.dataset.product) {
            selectedProduct = button.dataset.product;
            updateSelection(productOptions, selectedProduct, 'product');
            renderAddOns();
            calculatePrice();
        }
    });

    durationOptions.addEventListener('click', (event) => {
        const button = event.target.closest('.option-button');
        if (button && button.dataset.duration) {
            selectedDurationMonths = parseInt(button.dataset.duration);
            updateSelection(durationOptions, selectedDurationMonths, 'duration');
            renderAddOns();
            calculatePrice();
        }
    });

    numUsersInput.addEventListener('input', () => {
        numUsers = parseInt(numUsersInput.value);
        if (isNaN(numUsers) || numUsers < 1) {
            numUsers = 1;
            numUsersInput.value = 1;
        } else if (numUsers > 5) {
            numUsers = 5;
            numUsersInput.value = 5;
        }
        usersSlider.value = numUsers;
        usersDisplay.textContent = `${numUsers} User(s)`;
        calculatePrice();
    });

    usersSlider.addEventListener('input', () => {
        numUsers = parseInt(usersSlider.value);
        numUsersInput.value = numUsers;
        usersDisplay.textContent = `${numUsers} User(s)`;
        calculatePrice();
    });

    decrementUsersButton.addEventListener('click', () => {
        if (numUsers > 1) {
            numUsers--;
            numUsersInput.value = numUsers;
            usersSlider.value = numUsers;
            usersDisplay.textContent = `${numUsers} User(s)`;
            calculatePrice();
        }
    });

    incrementUsersButton.addEventListener('click', () => {
        if (numUsers < 5) {
            numUsers++;
            numUsersInput.value = numUsers;
            usersSlider.value = numUsers;
            usersDisplay.textContent = `${numUsers} User(s)`;
            calculatePrice();
        }
    });

    viewFullPricelistLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayFullPricelist();
    });

    // --- Initial Setup ---
    usersDisplay.textContent = `${numUsers} User(s)`;
    displayPriceSpan.textContent = '$0.00';
    renderAddOns();

    // Select a default product and duration on load for better UX
    if (!selectedProduct && productOptions.children.length > 0) {
        productOptions.children[0].click();
    }
    if (!selectedDurationMonths && durationOptions.children.length > 0) {
        durationOptions.children[0].click();
    }
});
