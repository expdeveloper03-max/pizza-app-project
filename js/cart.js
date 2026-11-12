(function () {
    "use strict";

    const CART_KEY = "pizzasliceCart";

    function normalizeItem(item) {
        if (!item || typeof item !== "object" || typeof item.pizza !== "string" || !item.pizza.trim()) {
            throw new Error("The saved cart contains an invalid item.");
        }

        const quantity = Number(item.quantity === undefined ? 1 : item.quantity);
        const storedPrice = Number(item.price);
        const unitPrice = Number(item.unitPrice === undefined ? storedPrice / quantity : item.unitPrice);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99 ||
            !Number.isFinite(unitPrice) || unitPrice <= 0) {
            throw new Error("The saved cart contains an invalid quantity or price.");
        }

        return Object.assign({}, item, {
            quantity: quantity,
            unitPrice: unitPrice,
            price: unitPrice * quantity
        });
    }

    function getItems() {
        const raw = localStorage.getItem(CART_KEY);
        if (raw === null) {
            return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error("The saved cart data is invalid.");
        }
        return parsed.map(normalizeItem);
    }

    function saveItems(items) {
        const normalized = items.map(normalizeItem);
        localStorage.setItem(CART_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent("pizza-cart-updated"));
        return normalized;
    }

    function itemKey(item) {
        return JSON.stringify([
            item.pizza,
            item.size || "",
            item.dough || "",
            item.crust || "",
            item.extraToppings || [],
            item.removedIngredients || []
        ]);
    }

    function add(item) {
        const incoming = normalizeItem(item);
        const items = getItems();
        const key = itemKey(incoming);
        const existingIndex = items.findIndex(function (savedItem) {
            return itemKey(savedItem) === key;
        });

        if (existingIndex === -1) {
            items.push(incoming);
        } else {
            const combinedQuantity = items[existingIndex].quantity + incoming.quantity;
            if (combinedQuantity > 99) {
                throw new Error("You can add up to 99 of the same pizza.");
            }
            items[existingIndex].quantity = combinedQuantity;
            items[existingIndex].price = items[existingIndex].unitPrice * combinedQuantity;
        }

        saveItems(items);
        return items;
    }

    function setQuantity(index, quantity) {
        const items = getItems();
        const nextQuantity = Number(quantity);
        if (!Number.isInteger(index) || index < 0 || index >= items.length ||
            !Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 99) {
            throw new Error("Choose a quantity between 1 and 99.");
        }

        items[index].quantity = nextQuantity;
        items[index].price = items[index].unitPrice * nextQuantity;
        return saveItems(items);
    }

    function remove(index) {
        const items = getItems();
        if (!Number.isInteger(index) || index < 0 || index >= items.length) {
            throw new Error("That cart item could not be found.");
        }
        items.splice(index, 1);
        return saveItems(items);
    }

    function clear() {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new CustomEvent("pizza-cart-updated"));
    }

    function refreshBadges() {
        const badges = document.querySelectorAll("[data-cart-count]");
        if (!badges.length) {
            return;
        }

        try {
            const count = getItems().reduce(function (total, item) {
                return total + item.quantity;
            }, 0);
            badges.forEach(function (badge) {
                badge.textContent = String(count);
                badge.setAttribute("aria-label", count + (count === 1 ? " item in cart" : " items in cart"));
            });
        } catch (error) {
            badges.forEach(function (badge) {
                badge.textContent = "!";
                badge.setAttribute("aria-label", "Cart could not be loaded");
            });
            const feedback = document.querySelector("[data-cart-error]");
            if (feedback) {
                feedback.textContent = "Your saved cart could not be read. Please clear the site’s saved cart data before continuing.";
            }
            console.error("Could not read the saved cart.", error);
        }
    }

    window.PizzaCart = {
        getItems: getItems,
        add: add,
        setQuantity: setQuantity,
        remove: remove,
        clear: clear,
        refreshBadges: refreshBadges
    };

    window.addEventListener("pizza-cart-updated", refreshBadges);
    window.addEventListener("storage", refreshBadges);
    document.addEventListener("DOMContentLoaded", refreshBadges);
}());
