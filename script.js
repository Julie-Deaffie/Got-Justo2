javascript
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const productOptions = document.getElementById('productOptions');
    const durationOptions = document.getElementById('durationOptions');
    const numUsersInput = document.getElementById('numUsers');
    const usersSlider = document.getElementById('usersSlider');
    const usersDisplay = document.getElementById('usersDisplay');
    const decrementUsersButton = document.getElementById('decrementUsers');
    const incrementUsersButton = document.getElementById('incrementUsers');
    const calculatePriceButton = document.getElementById('calculatePriceButton');
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
            // Base total price for 1 user for the specified duration
            basePrices: {
                1: 9,   // 1 month: $9 total
                3: 24,  // 3 months: $24 total
                6: 45,  // 6 months: $45 total
                12: 84  // 12 months: $84 total
            },
            // Cost per *additional* user for the specified duration
            additionalUserCostPerDuration: {
                1: 3.00,  // $3.00 per additional user for 1 month
                3: 8.00,  // $8.00 per additional user for 3 months
                6: 15.00, // $15.00 per additional user for 6 months
                12: 30.00 // $30.00 per additional user for 12 months
            },
            addOns: [
                { id: 'a_addon1', name: 'Adult' }, // Renaming for clarity as per your list
                { id: 'common_addon1', name: '24/7' },
                { id: 'common_addon2', name: 'Low BW' }
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
            // Cost per *additional* user for the specified duration
            // Let's derive these based on your initial 50c/user/month for now, if list not provided.
            // If you have a separate list for B, please provide it.
            additionalUserCostPerDuration: {
                 1: (1 * 0.50), // 50c per month per additional user
                 3: (3 * 0.50), // 50c per month per additional user
                 6: (6 * 0.50), // 50c per month per additional user
                 12: (12 * 0.50) // 50c per month per additional user
            },
            addOns: [
                { id: 'common_addon1', name: '24/7' },
                { id: 'common_addon2', name: 'Adult' } // Moved Adult to common for B as per your description
            ]
        },
        'C': {
            // Product C prices are derived from A + B. No specific add-ons for C.
            // additionalUserCostPerDuration will also be calculated dynamically for C.
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
            // Corrected add-on cost display to reflect 50c/user/month * duration
            label.textContent = `${addOn.name} ($${(ADDON_COST_PER_USER_PER_MONTH * selectedDurationMonths).toFixed(2)}/user for duration)`;

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

    // Main price calculation logic
    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths || numUsers < 1) {
            displayPriceSpan.textContent = '$0.00';
            return 0;
        }

        let totalBasePriceForOneUser = 0;
        let additionalUserCostForDuration = 0;

        // Calculate base price (per duration for 1 user)
        if (selectedProduct === 'C') {
            // Product C is sum of A and B for the same duration
            const priceA = pricing['A'].basePrices[selectedDurationMonths];
            const priceB = pricing['B'].basePrices[selectedDurationMonths];
            totalBasePriceForOneUser = priceA + priceB;

            // Additional user cost for C is sum of A and B's additional user cost per duration
            additionalUserCostForDuration = pricing['A'].additionalUserCostPerDuration[selectedDurationMonths] +
                                            pricing['B'].additionalUserCostPerDuration[selectedDurationMonths];

        } else {
            totalBasePriceForOneUser = pricing[selectedProduct].basePrices[selectedDurationMonths];
            additionalUserCostForDuration = pricing[selectedProduct].additionalUserCostPerDuration[selectedDurationMonths];
        }

        // Calculate total additional user cost (for users beyond the first)
        let totalAdditionalUsersCost = 0;
        if (numUsers > 1) {
            const numAdditionalUsers = numUsers - 1;
            totalAdditionalUsersCost = numAdditionalUsers * additionalUserCostForDuration;
        }

        // Calculate add-on costs
        let addOnsTotalCost = 0;
        if (selectedAddOns.size > 0 && selectedProduct !== 'C') { // C has no add-ons
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
        const addOnNamesMap = {
            'a_addon1': 'Adult (A only)', // Clarify A exclusive
            'common_addon1': '24/7',
            'common_addon2': 'Low BW',
            // Correct mapping for B's add-ons based on your description
            'b_addon1': '24/7', // If B has its own specific 24/7
            'b_addon2': 'Adult'  // If B has its own specific Adult
        };

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
                } else {
                    oneUserPrice = pricing[productKey].basePrices[duration];
                    addlUserCostDisplay = pricing[productKey].additionalUserCostPerDuration[duration];
                }

                if (pricing[productKey].addOns && pricing[productKey].addOns.length > 0) {
                    availableAddOnsDisplay = pricing[productKey].addOns
                        .map(ao => addOnNamesMap[ao.id] || ao.name)
                        .join(', ');
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

        // Modal generation logic (remains the same)
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

        modal.style.display = 'flex'; // Show the modal
    }

    // --- Event Listeners (remain the same) ---
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
            renderAddOns(); // Re-render add-ons to update cost display
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

    calculatePriceButton.addEventListener('click', calculatePrice);

    viewFullPricelistLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayFullPricelist();
    });

    Skip to main content
Playground
52,073 tokens

Model
Okay, thank you for providing the "LIVE" price list for Option A. This is incredibly helpful for pinpointing the calculation discrepancy. I've reviewed your site `gotjusto.netlify.app` and compared the calculator's output with your provided list.

The current calculation logic for additional users and add-ons in the `script.js` is slightly different from what your "LIVE" list implies.

Here's the breakdown of the current issue and the required adjustments:

**Current Logic in `script.js`:**

*   `totalBasePriceForOneUser`: This is the base price for 1 user for the selected duration.
*   `additionalUsersCost`: This calculates `(numUsers - 1) * ADDITIONAL_USER_COST_PER_MONTH * selectedDurationMonths`. This means the **first user's additional user cost is zero**, which is correct.
*   `addOnsTotalCost`: This calculates `selectedAddOns.size * ADDON_COST_PER_USER_PER_MONTH * numUsers * selectedDurationMonths`. This means **add-ons are charged per user, including the first user.**

**Discrepancy with Your "LIVE" Pricelist (Option A, 1 Month):**

Let's take "Option A, 1 Month, 1 Connection" ($9.00). This matches `pricing.A.basePrices[1]`.
*   "1 Month + Adult (1 Connection)" is $9.50. This implies adding one add-on costs $0.50 * 1 user * 1 month = $0.50. `9.00 + 0.50 = 9.50`. This aligns with the add-on cost being applied to *all* users (including the first).

Now, let's look at "1 Month (2 Connections)" is $12.00.
*   Our script calculates: `basePrice (9.00) + (2 - 1) * 0.50 * 1 = 9.00 + 0.50 = $9.50`.
*   Your list shows $12.00. This is the **main source of the discrepancy.**

**The core issue is that the base prices you provided (`A= 9/24/45/84$`, etc.) are *already* for 1 user, but the additional user cost calculation isn't quite right according to your example list.**

Your list implies:
*   **The base price (`pricing.A.basePrices[duration]`) is the price for 1 user, WITHOUT any additional user charges.**
*   **Each *additional* user (beyond the first) adds a specific amount to the *total* price for that duration.**

Let's re-derive the cost for each "additional connection" (user) for Product A, 1 Month:
*   1 Connection: $9.00
*   2 Connections: $12.00  (Difference: $3.00 for the 2nd user)
*   3 Connections: $15.00  (Difference: $3.00 for the 3rd user)
*   4 Connections: $18.00  (Difference: $3.00 for the 4th user)
*   5 Connections: $21.00  (Difference: $3.00 for the 5th user)

It seems for Product A (1 Month), each additional user (2nd, 3rd, 4th, 5th) costs $3.00 for that month.
This is **NOT** 50 cents per user per month. It's a flat rate per additional user for the chosen duration.

We need to make `ADDITIONAL_USER_COST_PER_MONTH` actually represent `ADDITIONAL_USER_COST_PER_MONTH * duration`.

---

**Revised Interpretation of Additional User Costs (Matching Your List):**

It appears the "50¢ per user per month" for additional users was a slight miscommunication, or I misinterpreted it against your provided list.

Instead, the cost of an "additional user" (any user beyond the first) depends on the duration. It looks like it's a fixed cost *per additional user per duration*, not a flat 50c/month.

Let's calculate the "cost per additional user per duration":
*   **Product A:**
    *   1 Month: $3.00 per additional user (e.g., $12.00 for 2 users - $9.00 for 1 user = $3.00)
    *   3 Months: $8.00 per additional user (e.g., $32.00 for 2 users - $24.00 for 1 user = $8.00)
    *   6 Months: $15.00 per additional user (e.g., $60.00 for 2 users - $45.00 for 1 user = $15.00)
    *   12 Months: $30.00 per additional user (e.g., $114.00 for 2 users - $84.00 for 1 user = $30.00)

This implies that the `ADDITIONAL_USER_COST_PER_MONTH` constant should be rethought. It's not 50 cents per month, but rather a "cost per additional user for THIS duration."

Let's adjust the `pricing` structure to store these "additional user costs per duration" directly, similar to how `basePrices` are stored.

---

### Corrected `script.js` (Major Update to Pricing Logic)

This update will redefine how additional user costs are handled.

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
    const calculatePriceButton = document.getElementById('calculatePriceButton');
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
            // Base total price for 1 user for the specified duration
            basePrices: {
                1: 9,   // 1 month: $9 total
                3: 24,  // 3 months: $24 total
                6: 45,  // 6 months: $45 total
                12: 84  // 12 months: $84 total
            },
            // Cost per *additional* user for the specified duration
            additionalUserCostPerDuration: {
                1: 3.00,  // $3.00 per additional user for 1 month
                3: 8.00,  // $8.00 per additional user for 3 months
                6: 15.00, // $15.00 per additional user for 6 months
                12: 30.00 // $30.00 per additional user for 12 months
            },
            addOns: [
                { id: 'a_addon1', name: 'Adult' }, // Renaming for clarity as per your list
                { id: 'common_addon1', name: '24/7' },
                { id: 'common_addon2', name: 'Low BW' }
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
            // Cost per *additional* user for the specified duration
            // Let's derive these based on your initial 50c/user/month for now, if list not provided.
            // If you have a separate list for B, please provide it.
            additionalUserCostPerDuration: {
                 1: (1 * 0.50), // 50c per month per additional user
                 3: (3 * 0.50), // 50c per month per additional user
                 6: (6 * 0.50), // 50c per month per additional user
                 12: (12 * 0.50) // 50c per month per additional user
            },
            addOns: [
                { id: 'common_addon1', name: '24/7' },
                { id: 'common_addon2', name: 'Adult' } // Moved Adult to common for B as per your description
            ]
        },
        'C': {
            // Product C prices are derived from A + B. No specific add-ons for C.
            // additionalUserCostPerDuration will also be calculated dynamically for C.
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
            // Corrected add-on cost display to reflect 50c/user/month * duration
            label.textContent = `${addOn.name} ($${(ADDON_COST_PER_USER_PER_MONTH * selectedDurationMonths).toFixed(2)}/user for duration)`;

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

    // Main price calculation logic
    function calculatePrice() {
        if (!selectedProduct || !selectedDurationMonths || numUsers < 1) {
            displayPriceSpan.textContent = '$0.00';
            return 0;
        }

        let totalBasePriceForOneUser = 0;
        let additionalUserCostForDuration = 0;

        // Calculate base price (per duration for 1 user)
        if (selectedProduct === 'C') {
            // Product C is sum of A and B for the same duration
            const priceA = pricing['A'].basePrices[selectedDurationMonths];
            const priceB = pricing['B'].basePrices[selectedDurationMonths];
            totalBasePriceForOneUser = priceA + priceB;

            // Additional user cost for C is sum of A and B's additional user cost per duration
            additionalUserCostForDuration = pricing['A'].additionalUserCostPerDuration[selectedDurationMonths] +
                                            pricing['B'].additionalUserCostPerDuration[selectedDurationMonths];

        } else {
            totalBasePriceForOneUser = pricing[selectedProduct].basePrices[selectedDurationMonths];
            additionalUserCostForDuration = pricing[selectedProduct].additionalUserCostPerDuration[selectedDurationMonths];
        }

        // Calculate total additional user cost (for users beyond the first)
        let totalAdditionalUsersCost = 0;
        if (numUsers > 1) {
            const numAdditionalUsers = numUsers - 1;
            totalAdditionalUsersCost = numAdditionalUsers * additionalUserCostForDuration;
        }

        // Calculate add-on costs
        let addOnsTotalCost = 0;
        if (selectedAddOns.size > 0 && selectedProduct !== 'C') { // C has no add-ons
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
        const addOnNamesMap = {
            'a_addon1': 'Adult (A only)', // Clarify A exclusive
            'common_addon1': '24/7',
            'common_addon2': 'Low BW',
            // Correct mapping for B's add-ons based on your description
            'b_addon1': '24/7', // If B has its own specific 24/7
            'b_addon2': 'Adult'  // If B has its own specific Adult
        };

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
                } else {
                    oneUserPrice = pricing[productKey].basePrices[duration];
                    addlUserCostDisplay = pricing[productKey].additionalUserCostPerDuration[duration];
                }

                if (pricing[productKey].addOns && pricing[productKey].addOns.length > 0) {
                    availableAddOnsDisplay = pricing[productKey].addOns
                        .map(ao => addOnNamesMap[ao.id] || ao.name)
                        .join(', ');
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

        // Modal generation logic (remains the same)
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

        modal.style.display = 'flex'; // Show the modal
    }

    // --- Event Listeners (remain the same) ---
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
            renderAddOns(); // Re-render add-ons to update cost display
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

    calculatePriceButton.addEventListener('click', calculatePrice);

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
        productOptions.children[0].click(); // Select Product A by default
    }
    if (!selectedDurationMonths && durationOptions.children.length > 0) {
        durationOptions.children[0].click(); // Select 1 Month by default
    }
});


