(function () {
    "use strict";

    const feedback = document.getElementById("menu-cart-message");
    const choices = document.querySelectorAll(".pizza-choice");

    function isQuickAdd(item, name) {
        return item.pizza === name &&
            item.size === "S" &&
            item.dough === "Classic" &&
            item.crust === "Original" &&
            (!item.extraToppings || item.extraToppings.length === 0) &&
            (!item.removedIngredients || item.removedIngredients.length === 0);
    }

    function refreshChoices() {
        try {
            const items = window.PizzaCart.getItems();
            choices.forEach(function (choice) {
                const card = choice.closest(".menu-card");
                const name = card.querySelector("h3").textContent.trim();
                choice.checked = items.some(function (item) {
                    return isQuickAdd(item, name);
                });
            });
        } catch (error) {
            feedback.textContent = "Your saved cart could not be read. Please check your browser’s saved site data.";
            feedback.classList.add("cart-error");
            console.error("Could not sync menu cart buttons.", error);
        }
    }

    choices.forEach(function (choice) {
        choice.addEventListener("change", function () {
            const card = choice.closest(".menu-card");
            const name = card.querySelector("h3").textContent.trim();
            const image = card.querySelector(".menu-media img");
            const price = Number(card.querySelector(".menu-price").textContent.replace(/[^\d.]/g, ""));

            try {
                const items = window.PizzaCart.getItems();
                if (choice.checked) {
                    window.PizzaCart.add({
                        pizza: name,
                        image: image.getAttribute("src"),
                        quantity: 1,
                        size: "S",
                        dough: "Classic",
                        crust: "Original",
                        extraToppings: [],
                        removedIngredients: [],
                        price: price
                    });
                    feedback.textContent = name + " added to your cart.";
                } else {
                    const index = items.findIndex(function (item) {
                        return isQuickAdd(item, name);
                    });
                    if (index !== -1) {
                        window.PizzaCart.remove(index);
                    }
                    feedback.textContent = name + " removed from your cart.";
                }
                feedback.classList.remove("cart-error");
            } catch (error) {
                choice.checked = !choice.checked;
                feedback.textContent = "We couldn’t update your cart. Please check your browser storage and try again.";
                feedback.classList.add("cart-error");
                console.error("Could not update cart from menu.", error);
            }
        });
    });

    window.addEventListener("pizza-cart-updated", refreshChoices);
    refreshChoices();
}());
