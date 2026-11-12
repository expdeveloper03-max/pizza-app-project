(function () {
    "use strict";

    const list = document.getElementById("cart-items");
    const empty = document.getElementById("cart-empty");
    const content = document.getElementById("cart-content");
    const subtotalOutput = document.getElementById("cart-subtotal");
    const countOutput = document.getElementById("cart-item-count");
    const message = document.getElementById("cart-message");

    function money(value) {
        return "GH₵" + value.toFixed(2).replace(/\.00$/, "");
    }

    function render() {
        let items;
        try {
            items = window.PizzaCart.getItems();
        } catch (error) {
            message.textContent = "We couldn’t load your cart. Please check your browser’s saved site data and try again.";
            message.classList.add("cart-error");
            console.error("Could not render the cart.", error);
            content.hidden = true;
            empty.hidden = true;
            return;
        }

        list.replaceChildren();
        message.textContent = "";
        message.classList.remove("cart-error");
        empty.hidden = items.length > 0;
        content.hidden = items.length === 0;

        if (!items.length) {
            return;
        }

        let subtotal = 0;
        let count = 0;
        items.forEach(function (item, index) {
            subtotal += item.price;
            count += item.quantity;

            const row = document.createElement("article");
            row.className = "cart-item";
            if (item.image) {
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = "";
                image.loading = "lazy";
                row.append(image);
            }

            const info = document.createElement("div");
            info.className = "cart-item-info";
            const title = document.createElement("h2");
            title.textContent = item.pizza;
            info.append(title);

            const options = [];
            if (item.size) options.push(item.size + " size");
            if (item.dough) options.push(item.dough + " dough");
            if (item.crust) options.push(item.crust);
            if (item.extraToppings && item.extraToppings.length) options.push("Extra: " + item.extraToppings.join(", "));
            if (item.removedIngredients && item.removedIngredients.length) options.push("No: " + item.removedIngredients.join(", "));
            if (options.length) {
                const description = document.createElement("p");
                description.textContent = options.join(" · ");
                info.append(description);
            }
            row.append(info);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";
            const quantityLabel = document.createElement("label");
            quantityLabel.textContent = "Qty";
            const quantity = document.createElement("input");
            quantity.type = "number";
            quantity.min = "1";
            quantity.max = "99";
            quantity.step = "1";
            quantity.value = String(item.quantity);
            quantity.setAttribute("aria-label", "Quantity for " + item.pizza);
            quantity.dataset.cartQuantity = String(index);
            quantityLabel.append(quantity);

            const price = document.createElement("strong");
            price.textContent = money(item.price);
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "cart-remove";
            remove.dataset.cartRemove = String(index);
            remove.textContent = "Remove";
            controls.append(quantityLabel, price, remove);
            row.append(controls);
            list.append(row);
        });

        subtotalOutput.textContent = money(subtotal);
        countOutput.textContent = count + (count === 1 ? " item" : " items");
    }

    list.addEventListener("change", function (event) {
        const input = event.target.closest("[data-cart-quantity]");
        if (!input) return;
        try {
            window.PizzaCart.setQuantity(Number(input.dataset.cartQuantity), Number(input.value));
            render();
        } catch (error) {
            message.textContent = error.message;
            message.classList.add("cart-error");
            render();
            message.textContent = error.message;
            message.classList.add("cart-error");
        }
    });

    list.addEventListener("click", function (event) {
        const button = event.target.closest("[data-cart-remove]");
        if (!button) return;
        try {
            window.PizzaCart.remove(Number(button.dataset.cartRemove));
            render();
        } catch (error) {
            message.textContent = "We couldn’t remove that item. Please try again.";
            message.classList.add("cart-error");
            console.error("Could not remove a cart item.", error);
        }
    });

    window.addEventListener("pizza-cart-updated", render);
    render();
}());
