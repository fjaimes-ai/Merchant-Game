// ============================================================
// MERCHANT GAME
// A trading game where you buy low and sell high across towns
// ============================================================


// ============================================================
// STAGE 1: WORLD DATA
// This is fixed information that never changes during play.
// Each town has goods with buy prices (what you pay) and 
// sell prices (what you get when selling).
// ============================================================

const towns = {
    harbormouth: {
        name: "Harbormouth",
        description: "A bustling port town",
        goods: [
            // Local goods - cheap to buy here
            { name: "Fish", buyPrice: 4, sellPrice: 2, tier: "raw" },
            { name: "Salt", buyPrice: 5, sellPrice: 3, tier: "raw" },
            { name: "Pearls", buyPrice: 25, sellPrice: 15, tier: "luxury" },
            { name: "Spices", buyPrice: 20, sellPrice: 12, tier: "luxury" },
            // Imported goods - expensive here
            { name: "Wheat", buyPrice: 14, sellPrice: 10, tier: "raw" },
            { name: "Livestock", buyPrice: 18, sellPrice: 12, tier: "raw" },
            { name: "Wool", buyPrice: 12, sellPrice: 8, tier: "raw" },
            { name: "Ale", buyPrice: 16, sellPrice: 11, tier: "manufactured" },
            { name: "Coal", buyPrice: 15, sellPrice: 10, tier: "raw" },
            { name: "Iron", buyPrice: 20, sellPrice: 14, tier: "raw" },
            { name: "Tools", buyPrice: 28, sellPrice: 20, tier: "manufactured" },
            { name: "Gemstones", buyPrice: 45, sellPrice: 35, tier: "luxury" }
        ]
    },
    millfield: {
        name: "Millfield",
        description: "A peaceful farming town",
        goods: [
            // Local goods - cheap to buy here
            { name: "Wheat", buyPrice: 4, sellPrice: 2, tier: "raw" },
            { name: "Livestock", buyPrice: 6, sellPrice: 3, tier: "raw" },
            { name: "Wool", buyPrice: 5, sellPrice: 3, tier: "raw" },
            { name: "Ale", buyPrice: 8, sellPrice: 5, tier: "manufactured" },
            // Imported goods - expensive here
            { name: "Fish", buyPrice: 14, sellPrice: 10, tier: "raw" },
            { name: "Salt", buyPrice: 12, sellPrice: 8, tier: "raw" },
            { name: "Pearls", buyPrice: 40, sellPrice: 30, tier: "luxury" },
            { name: "Spices", buyPrice: 35, sellPrice: 25, tier: "luxury" },
            { name: "Coal", buyPrice: 16, sellPrice: 11, tier: "raw" },
            { name: "Iron", buyPrice: 22, sellPrice: 15, tier: "raw" },
            { name: "Tools", buyPrice: 18, sellPrice: 12, tier: "manufactured" },
            { name: "Gemstones", buyPrice: 50, sellPrice: 38, tier: "luxury" }
        ]
    },
    ironhold: {
        name: "Ironhold",
        description: "A rugged mining town in the mountains",
        goods: [
            // Local goods - cheap to buy here
            { name: "Coal", buyPrice: 3, sellPrice: 2, tier: "raw" },
            { name: "Iron", buyPrice: 6, sellPrice: 4, tier: "raw" },
            { name: "Tools", buyPrice: 10, sellPrice: 6, tier: "manufactured" },
            { name: "Gemstones", buyPrice: 22, sellPrice: 14, tier: "luxury" },
            // Imported goods - expensive here
            { name: "Fish", buyPrice: 18, sellPrice: 12, tier: "raw" },
            { name: "Salt", buyPrice: 14, sellPrice: 9, tier: "raw" },
            { name: "Pearls", buyPrice: 45, sellPrice: 32, tier: "luxury" },
            { name: "Spices", buyPrice: 38, sellPrice: 28, tier: "luxury" },
            { name: "Wheat", buyPrice: 12, sellPrice: 8, tier: "raw" },
            { name: "Livestock", buyPrice: 16, sellPrice: 10, tier: "raw" },
            { name: "Wool", buyPrice: 14, sellPrice: 9, tier: "raw" },
            { name: "Ale", buyPrice: 15, sellPrice: 10, tier: "manufactured" }
        ]
    },
    aldenmoor: {
        name: "Aldenmoor",
        description: "A wealthy market city",
        goods: [
            // No local production - all goods at mid-range prices
            // Good for selling when unsure, fair prices for everything
            { name: "Fish", buyPrice: 10, sellPrice: 7, tier: "raw" },
            { name: "Salt", buyPrice: 9, sellPrice: 6, tier: "raw" },
            { name: "Pearls", buyPrice: 35, sellPrice: 28, tier: "luxury" },
            { name: "Spices", buyPrice: 30, sellPrice: 22, tier: "luxury" },
            { name: "Wheat", buyPrice: 9, sellPrice: 6, tier: "raw" },
            { name: "Livestock", buyPrice: 12, sellPrice: 8, tier: "raw" },
            { name: "Wool", buyPrice: 10, sellPrice: 7, tier: "raw" },
            { name: "Ale", buyPrice: 13, sellPrice: 9, tier: "manufactured" },
            { name: "Coal", buyPrice: 10, sellPrice: 7, tier: "raw" },
            { name: "Iron", buyPrice: 14, sellPrice: 10, tier: "raw" },
            { name: "Tools", buyPrice: 20, sellPrice: 14, tier: "manufactured" },
            { name: "Gemstones", buyPrice: 38, sellPrice: 30, tier: "luxury" }
        ]
    }
};


// ============================================================
// STAGE 2: STATE
// This is data that changes during play.
// We keep it in one object so it's easy to find and update.
// ============================================================

const state = {
    currentTown: "harbormouth",
    gold: 100,
    inventory: [],
    message: "Welcome, merchant! Buy low, sell high, and make your fortune.",
    messageLog: [],  // Stores all past messages, newest last
    turn: 0,         // Increments every time the player travels
    events: [],      // Active world events that affect prices
    knownPrices: {}  // Tracks which town+good prices the player has discovered
    // e.g. { "millfield-Wheat": true, "harbormouth-Fish": true }
};


// ============================================================
// STAGE 3: DOM CONNECTIONS
// These connect our JavaScript to the HTML elements on the page.
// Each variable holds a reference to one HTML element.
// ============================================================

const townNameDisplay = document.getElementById("townName");
const goldDisplay = document.getElementById("gold");
const inventoryDisplay = document.getElementById("inventory");
const marketDisplay = document.getElementById("market");
const travelDisplay = document.getElementById("travel");
const messageLogDisplay = document.getElementById("message-log");


// ============================================================
// STAGE 3.5: HELPER FUNCTIONS
// ============================================================

// ------------------------------------------------------------
// getPrice(townKey, goodName, basePrice)
// Returns the current price for a good, modified by any active events.
// ------------------------------------------------------------

function getPrice(townKey, goodName, basePrice) {
    // Find any active event matching this town and good
    const event = state.events.find(function (e) {
        return e.town === townKey && e.good === goodName;
    });
    if (!event) return basePrice;
    // Round to nearest whole number
    return Math.round(basePrice * event.effect);
}


// ------------------------------------------------------------
// generateEvent()
// Creates a random world event affecting prices in a town.
// Called from travelTo when the encounter roll hits the event range.
// ------------------------------------------------------------

function generateEvent() {
    const townKeys = Object.keys(towns);
    const randomTownKey = townKeys[Math.floor(Math.random() * townKeys.length)];
    const randomTown = towns[randomTownKey];
    const randomGood = randomTown.goods[Math.floor(Math.random() * randomTown.goods.length)];

    // Pick a random effect: shortage (prices up) or glut (prices down)
    const shortage = Math.random() > 0.5;
    const effect = shortage
        ? 1.4 + Math.random() * 0.4   // 1.4x to 1.8x (shortage)
        : 0.4 + Math.random() * 0.3;  // 0.4x to 0.7x (glut)

    // Event lasts 3-6 turns from now
    const duration = 3 + Math.floor(Math.random() * 4);
    const expiresOnTurn = state.turn + duration;

    // Remove any existing event for this town+good before adding the new one
    state.events = state.events.filter(function (e) {
        return !(e.town === randomTownKey && e.good === randomGood.name);
    });

    state.events.push({
        town: randomTownKey,
        good: randomGood.name,
        effect: effect,
        expiresOnTurn: expiresOnTurn,
        shortage: shortage
    });

    return {
        townName: randomTown.name,
        goodName: randomGood.name,
        shortage: shortage,
        expiresOnTurn: expiresOnTurn
    };
}


// ------------------------------------------------------------
// revealPrice(townKey, goodName)
// Marks a town+good price as known to the player.
// ------------------------------------------------------------

function revealPrice(townKey, goodName) {
    state.knownPrices[townKey + "-" + goodName] = true;
}


// ============================================================
// STAGE 4: RENDER FUNCTION
// This function updates everything on the screen.
// It reads from state but NEVER changes state.
// We call it once at the start and after every action.
// ============================================================

function renderGame() {
    // Find the current town's data using the key stored in state
    const currentTown = towns[state.currentTown];

    // Update the town name display
    townNameDisplay.textContent = currentTown.name + " - " + currentTown.description;

    // Update the gold display
    goldDisplay.textContent = state.gold + " gold";

    // Update the inventory display
    // If inventory is empty, show a message. Otherwise, list the items.
    if (state.inventory.length === 0) {
        inventoryDisplay.textContent = "Your pack is empty.";
    } else {
        // Count how many of each item the player is carrying
        const counts = {};
        state.inventory.forEach(function (item) {
            counts[item] = (counts[item] || 0) + 1;
        });

        // Build a display string like "Fish (x2), Coal, Wool (x3)"
        const parts = Object.keys(counts).map(function (item) {
            return counts[item] > 1 ? item + " (x" + counts[item] + ")" : item;
        });
        inventoryDisplay.textContent = parts.join(", ");
    }

    // Build the market display dynamically
    // Clear out any old content first
    marketDisplay.innerHTML = "";

    // Loop through each good in the current town
    currentTown.goods.forEach(function (good) {
        // Create a container for this good's row
        const goodRow = document.createElement("div");
        goodRow.style.marginBottom = "8px";

        // Check if the player knows this good's price in this town
        const priceKey = state.currentTown + "-" + good.name;
        const isKnown = state.knownPrices[priceKey];

        // Use getPrice to apply any active world events
        const currentBuyPrice = getPrice(state.currentTown, good.name, good.buyPrice);
        const currentSellPrice = getPrice(state.currentTown, good.name, good.sellPrice);

        // Check if an event is affecting this good
        const activeEvent = state.events.find(function (e) {
            return e.town === state.currentTown && e.good === good.name;
        });
        const eventTag = activeEvent && isKnown
            ? (activeEvent.shortage ? " ⬆ shortage" : " ⬇ glut")
            : "";

        // Show prices if known, otherwise show "?"
        const buyDisplay = isKnown ? currentBuyPrice + " gold" : "?";
        const sellDisplay = isKnown ? currentSellPrice + " gold" : "?";

        const goodInfo = document.createElement("span");
        goodInfo.textContent = good.name + " (" + good.tier + ")" + eventTag + " - Buy: " + buyDisplay + ", Sell: " + sellDisplay + "  ";
        if (activeEvent && isKnown) {
            goodInfo.style.color = activeEvent.shortage ? "#8b2020" : "#2a6b2a";
        }
        goodRow.appendChild(goodInfo);

        // Quantity input for buying
        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.value = "1";
        qtyInput.style.width = "40px";
        qtyInput.style.marginRight = "4px";
        goodRow.appendChild(qtyInput);

        // Create the buy button - opens confirmation overlay
        const buyButton = document.createElement("button");
        buyButton.textContent = "Buy";
        buyButton.onclick = function () {
            showBuyConfirm(good, qtyInput);
        };
        goodRow.appendChild(buyButton);

        // Add a small space between buttons
        const spacer = document.createElement("span");
        spacer.textContent = " ";
        goodRow.appendChild(spacer);

        // Quantity input for selling
        const sellQtyInput = document.createElement("input");
        sellQtyInput.type = "number";
        sellQtyInput.min = "1";
        sellQtyInput.value = "1";
        sellQtyInput.style.width = "40px";
        sellQtyInput.style.marginRight = "4px";
        goodRow.appendChild(sellQtyInput);

        // Create the sell button - opens confirmation overlay
        const sellButton = document.createElement("button");
        sellButton.textContent = "Sell";
        sellButton.onclick = function () {
            showSellConfirm(good, sellQtyInput);
        };
        goodRow.appendChild(sellButton);

        // Add this row to the market display
        marketDisplay.appendChild(goodRow);
    });

    // Build the travel buttons dynamically
    // Clear out any old content first
    travelDisplay.innerHTML = "";

    // Loop through all town keys
    // Object.keys() gives us an array of all the keys in the towns object
    const townKeys = Object.keys(towns);

    townKeys.forEach(function (townKey) {
        // Skip the current town - you can't travel to where you already are
        if (townKey === state.currentTown) {
            return; // This skips to the next iteration of the loop
        }

        // Create a travel button for this town
        const travelButton = document.createElement("button");
        travelButton.textContent = "Travel to " + towns[townKey].name;
        travelButton.style.marginRight = "8px";
        travelButton.style.marginBottom = "8px";

        // When clicked, call travelTo with this town's key
        travelButton.onclick = function () {
            travelTo(townKey);
        };

        travelDisplay.appendChild(travelButton);
    });

    // Build the message log
    // Clear and re-render all messages, newest at the bottom
    messageLogDisplay.innerHTML = "";
    state.messageLog.forEach(function (msg, index) {
        const entry = document.createElement("p");
        entry.className = "message-entry" + (index < state.messageLog.length - 3 ? " old" : "");
        entry.textContent = msg;
        messageLogDisplay.appendChild(entry);
    });
    // Scroll to the bottom to show the newest message
    messageLogDisplay.scrollTop = messageLogDisplay.scrollHeight;
}


// ============================================================
// STAGE 5: LOGIC FUNCTIONS
// These functions handle player actions.
// Each one updates state, sets a message, and calls renderGame().
// ============================================================


// ------------------------------------------------------------
// showBuyConfirm(good, qtyInput)
// Shows the styled overlay with a summary before buying.
// ------------------------------------------------------------

function showBuyConfirm(good, qtyInput) {
    const qty = parseInt(qtyInput.value) || 1;
    const priceKey = state.currentTown + "-" + good.name;
    const isKnown = state.knownPrices[priceKey];

    // If price is unknown, skip the overlay — the player is buying blind
    if (!isKnown) {
        buyGood(good, qty);
        return;
    }

    const currentPrice = getPrice(state.currentTown, good.name, good.buyPrice);
    const totalCost = currentPrice * qty;

    document.getElementById("overlay-message").textContent =
        "Buy " + qty + "x " + good.name + " for " + totalCost + " gold?";

    document.getElementById("overlay").style.display = "block";

    document.getElementById("overlay-confirm").onclick = function () {
        document.getElementById("overlay").style.display = "none";
        buyGood(good, qty);
    };

    document.getElementById("overlay-cancel").onclick = function () {
        document.getElementById("overlay").style.display = "none";
    };
}


// ------------------------------------------------------------
// buyGood(good, qty)
// Called after the player confirms a purchase.
// ------------------------------------------------------------

function buyGood(good, qty) {
    qty = qty || 1;
    const totalCost = getPrice(state.currentTown, good.name, good.buyPrice) * qty;

    // Check if the player has enough gold
    if (state.gold < totalCost) {
        state.message = "You don't have enough gold to buy " + qty + "x " + good.name + "."; state.messageLog.push(state.message);
        renderGame();
        return;
    }

    // Complete the purchase
    state.gold = state.gold - totalCost;
    for (let i = 0; i < qty; i++) {
        state.inventory.push(good.name);
    }
    revealPrice(state.currentTown, good.name);
    state.message = "You bought " + qty + "x " + good.name + " for " + totalCost + " gold."; state.messageLog.push(state.message);

    renderGame();
}


// ------------------------------------------------------------
// showSellConfirm(good, qtyInput)
// Shows the styled overlay with a summary before selling.
// ------------------------------------------------------------

function showSellConfirm(good, qtyInput) {
    const qty = parseInt(qtyInput.value) || 1;
    const priceKey = state.currentTown + "-" + good.name;
    const isKnown = state.knownPrices[priceKey];

    // Count how many the player actually has
    const owned = state.inventory.filter(function (item) { return item === good.name; }).length;

    if (owned === 0) {
        state.message = "You don't have any " + good.name + " to sell."; state.messageLog.push(state.message);
        renderGame();
        return;
    }

    if (qty > owned) {
        state.message = "You only have " + owned + "x " + good.name + "."; state.messageLog.push(state.message);
        renderGame();
        return;
    }

    // If price is unknown, skip the overlay — the player is selling blind
    if (!isKnown) {
        sellGood(good, qty);
        return;
    }

    const currentPrice = getPrice(state.currentTown, good.name, good.sellPrice);
    const totalEarned = currentPrice * qty;

    document.getElementById("overlay-message").textContent =
        "Sell " + qty + "x " + good.name + " for " + totalEarned + " gold?";

    document.getElementById("overlay").style.display = "block";

    document.getElementById("overlay-confirm").onclick = function () {
        document.getElementById("overlay").style.display = "none";
        sellGood(good, qty);
    };

    document.getElementById("overlay-cancel").onclick = function () {
        document.getElementById("overlay").style.display = "none";
    };
}


// ------------------------------------------------------------
// sellGood(good, qty)
// Called after the player confirms a sale.
// ------------------------------------------------------------

function sellGood(good, qty) {
    qty = qty || 1;

    // Check if the player has enough of this good
    const owned = state.inventory.filter(function (item) { return item === good.name; }).length;
    if (owned < qty) {
        state.message = "You don't have enough " + good.name + " to sell."; state.messageLog.push(state.message);
        renderGame();
        return;
    }

    // Complete the sale - remove qty instances from inventory
    let removed = 0;
    state.inventory = state.inventory.filter(function (item) {
        if (item === good.name && removed < qty) {
            removed++;
            return false;
        }
        return true;
    });

    const totalEarned = getPrice(state.currentTown, good.name, good.sellPrice) * qty;
    state.gold = state.gold + totalEarned;
    revealPrice(state.currentTown, good.name);
    state.message = "You sold " + qty + "x " + good.name + " for " + totalEarned + " gold."; state.messageLog.push(state.message);

    renderGame();
}


// ------------------------------------------------------------
// travelTo(townKey)
// Called when the player clicks a Travel button.
// The 'townKey' parameter is the key of the destination town.
// ------------------------------------------------------------

function travelTo(townKey) {
    // Get the destination town's name for messages
    const destinationName = towns[townKey].name;

    // Update the current town
    state.currentTown = townKey;

    // Increment the turn counter
    state.turn = state.turn + 1;

    // Remove any events that have expired
    state.events = state.events.filter(function (e) {
        return e.expiresOnTurn > state.turn;
    });

    // Roll for a random encounter
    // Math.random() gives a number between 0 and 1
    const roll = Math.random();

    // Check for different encounters based on the roll
    // Each encounter has a chance range

    if (roll < 0.10) {
        // 10% chance: Bandit encounter (loses gold)
        // Guard: skip if player has no gold
        if (state.gold <= 0) {
            state.message = "You arrived safely in " + destinationName + "."; state.messageLog.push(state.message);
        } else {
            // Lose 5-15 gold
            const goldLost = 5 + Math.floor(Math.random() * 11);
            // Don't lose more than you have
            const actualLoss = Math.min(goldLost, state.gold);
            state.gold = state.gold - actualLoss;
            state.message = "A bandit ambushed you on the road! You lost " + actualLoss + " gold. You arrived in " + destinationName + "."; state.messageLog.push(state.message);
        }
    } else if (roll < 0.20) {
        // 10% chance: Storm damages cargo (loses item)
        // Guard: skip if inventory is empty
        if (state.inventory.length === 0) {
            state.message = "You arrived safely in " + destinationName + "."; state.messageLog.push(state.message);
        } else {
            // Pick a random item to lose
            const randomIndex = Math.floor(Math.random() * state.inventory.length);
            const lostItem = state.inventory[randomIndex];
            // Remove the item using splice
            state.inventory.splice(randomIndex, 1);
            state.message = "A storm struck! Your " + lostItem + " was damaged beyond repair. You arrived in " + destinationName + "."; state.messageLog.push(state.message);
        }
    } else if (roll < 0.28) {
        // 8% chance: Broken wheel (loses gold)
        // Guard: skip if player has no gold
        if (state.gold <= 0) {
            state.message = "You arrived safely in " + destinationName + "."; state.messageLog.push(state.message);
        } else {
            // Repair costs 3-8 gold
            const repairCost = 3 + Math.floor(Math.random() * 6);
            const actualCost = Math.min(repairCost, state.gold);
            state.gold = state.gold - actualCost;
            state.message = "Your cart wheel broke! Repairs cost " + actualCost + " gold. You arrived in " + destinationName + "."; state.messageLog.push(state.message);
        }
    } else if (roll < 0.38) {
        // 10% chance: Friendly traveler buys an item
        // Guard: skip if inventory is empty
        if (state.inventory.length === 0) {
            state.message = "You arrived safely in " + destinationName + "."; state.messageLog.push(state.message);
        } else {
            // Pick a random item to sell
            const randomIndex = Math.floor(Math.random() * state.inventory.length);
            const soldItem = state.inventory[randomIndex];
            // Remove the item
            state.inventory.splice(randomIndex, 1);
            // Find the highest sell price for this item across all towns
            let bestSellPrice = 0;
            Object.keys(towns).forEach(function (townKey) {
                const match = towns[townKey].goods.find(function (g) { return g.name === soldItem; });
                if (match && match.sellPrice > bestSellPrice) {
                    bestSellPrice = match.sellPrice;
                }
            });
            // Pay 20% above the best sell price, rounded up
            const payment = Math.ceil(bestSellPrice * 1.2);
            state.gold = state.gold + payment;
            state.message = "A friendly traveler bought your " + soldItem + " for " + payment + " gold! You arrived in " + destinationName + "."; state.messageLog.push(state.message);
        }
    } else if (roll < 0.45) {
        // 7% chance: Find a lost purse (gains gold)
        const goldFound = 5 + Math.floor(Math.random() * 11);
        state.gold = state.gold + goldFound;
        state.message = "You found a lost purse on the road containing " + goldFound + " gold! You arrived in " + destinationName + "."; state.messageLog.push(state.message);
    } else if (roll < 0.67) {
        // 22% chance: A world event occurs affecting prices somewhere
        const event = generateEvent();
        const direction = event.shortage ? "shortage" : "surplus";
        const turns = event.expiresOnTurn - state.turn;
        state.message = "News reaches you: a " + direction + " of " + event.goodName + " in " + event.townName + ". Prices will be affected for about " + turns + " more turns. You arrived in " + destinationName + "."; state.messageLog.push(state.message);
    } else {
        // 48% chance: Uneventful journey
        state.message = "You arrived safely in " + destinationName + "."; state.messageLog.push(state.message);
    }

    renderGame();
}


// ============================================================
// START THE GAME
// Push the welcome message and render initial display
// ============================================================

state.messageLog.push(state.message);
renderGame();
