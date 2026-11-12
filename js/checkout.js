(function () {
    "use strict";

    const form = document.getElementById("checkout-form");
    const empty = document.getElementById("checkout-empty");
    const content = document.getElementById("checkout-content");
    const summary = document.getElementById("checkout-summary");
    const subtotalOutput = document.getElementById("checkout-subtotal");
    const message = document.getElementById("checkout-message");
    const confirmation = document.getElementById("checkout-confirmation");

    function money(value) {
        return "GH₵" + value.toFixed(2).replace(/\.00$/, "");
    }

    function renderSummary() {
        let items;
        try {
            items = window.PizzaCart.getItems();
        } catch (error) {
            message.textContent = "We couldn’t load your cart. Please return to the cart and check your saved site data.";
            message.classList.add("cart-error");
            content.hidden = true;
            empty.hidden = true;
            console.error("Could not load checkout cart.", error);
            return null;
        }

        summary.replaceChildren();
        let subtotal = 0;
        items.forEach(function (item) {
            subtotal += item.price;
            const row = document.createElement("li");
            const title = document.createElement("span");
            title.textContent = item.quantity + " × " + item.pizza + (item.size ? " (" + item.size + ")" : "");
            const price = document.createElement("strong");
            price.textContent = money(item.price);
            row.append(title, price);
            summary.append(row);
        });

        subtotalOutput.textContent = money(subtotal);
        empty.hidden = items.length > 0;
        content.hidden = items.length === 0;
        return items;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

        let items;
        try {
            items = window.PizzaCart.getItems();
            if (!items.length) {
                renderSummary();
                message.textContent = "Your cart is empty. Add a pizza before placing your order.";
                message.classList.add("cart-error");
                return;
            }

            const subtotal = items.reduce(function (total, item) {
                return total + item.price;
            }, 0);
            const order = {
                id: "PS-" + Date.now().toString(36).toUpperCase(),
                placedAt: new Date().toISOString(),
                status: "Order received",
                customer: {
                    name: document.getElementById("customer-name").value.trim(),
                    phone: document.getElementById("customer-phone").value.trim(),
                    address: document.getElementById("delivery-address").value.trim(),
                    city: document.getElementById("delivery-city").value.trim(),
                    instructions: document.getElementById("delivery-instructions").value.trim()
                },
                paymentMethod: "Cash on delivery",
                items: items,
                total: subtotal
            };
            const rawOrders = localStorage.getItem("pizzasliceOrders");
            const orders = rawOrders === null ? [] : JSON.parse(rawOrders);
            if (!Array.isArray(orders)) {
                throw new Error("Your saved order history is invalid.");
            }

            orders.unshift(order);
            localStorage.setItem("pizzasliceOrders", JSON.stringify(orders));
            window.PizzaCart.clear();
            content.hidden = true;
            confirmation.hidden = false;
            document.getElementById("confirmation-order-id").textContent = order.id;
            document.getElementById("confirmation-total").textContent = money(order.total);
            window.scrollTo(0, 0);
        } catch (error) {
            message.textContent = "We couldn’t save your order. Please check your browser storage and try again.";
            message.classList.add("cart-error");
            console.error("Could not place order.", error);
        }
    });

    renderSummary();
}());
