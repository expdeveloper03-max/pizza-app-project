const pizzas = {
    margherita: {
        name: "Margherita",
        image: "Pizza-Margheritta.webp",
        category: "Classic",
        description: "A simple Italian favorite with bright tomato, creamy mozzarella, and fresh basil.",
        ingredients: ["San Marzano tomato", "fresh mozzarella", "basil", "olive oil"]
    },
    "pepperoni-classic": {
        name: "Pepperoni Classic",
        image: "pepperoni-pizza.jpg",
        category: "Classic",
        description: "Mozzarella and crisp-edge pepperoni baked over our rich tomato sauce.",
        ingredients: ["tomato sauce", "mozzarella", "pepperoni"]
    },
    "four-cheese": {
        name: "Four Cheese",
        image: "four-cheese.jpg",
        category: "Classic",
        description: "A rich, melty blend of four cheeses on a golden crust.",
        ingredients: ["mozzarella", "cheddar", "parmesan", "gorgonzola"]
    },
    "truffle-mushroom": {
        name: "Truffle Mushroom",
        image: "mushroom-pizza.jpg",
        category: "Signature",
        description: "Earthy wild mushrooms meet fragrant truffle cream, thyme, and parmesan.",
        ingredients: ["wild mushrooms", "truffle cream", "thyme", "parmesan"]
    },
    "prosciutto-arugula": {
        name: "Prosciutto Arugula",
        image: "proscito.jpg",
        category: "Signature",
        description: "Savory prosciutto, peppery fresh arugula, parmesan, and a balsamic finish.",
        ingredients: ["prosciutto", "fresh arugula", "shaved parmesan", "balsamic glaze"]
    },
    "hot-honey-salami": {
        name: "Hot Honey Salami",
        image: "hot%20honey.jpg",
        category: "Signature",
        description: "Spicy salami and chili flakes mellowed with mozzarella and a honey drizzle.",
        ingredients: ["spicy salami", "chili flakes", "mozzarella", "hot honey"]
    },
    "chicago-deep-dish": {
        name: "Chicago Deep Dish",
        image: "chicago%20pizza.jpg",
        category: "Deep dish",
        description: "A buttery deep-dish crust layered with cheese, sausage, and chunky tomato.",
        ingredients: ["buttery crust", "layered cheese", "sausage", "chunky tomato"]
    },
    "detroit-pan": {
        name: "Detroit Pan",
        image: "detroit.webp",
        category: "Deep dish",
        description: "Thick pan-baked dough with caramelized cheese edges, pepperoni, and sauce on top.",
        ingredients: ["pan dough", "caramelized cheese", "pepperoni", "tomato sauce"]
    },
    "meat-lovers": {
        name: "Meat Lovers",
        image: "meatlover.jpg",
        category: "Meat lovers",
        description: "A hearty combination of five favorite meats, baked with mozzarella and tomato sauce.",
        ingredients: ["pepperoni", "sausage", "bacon", "ham", "ground beef", "mozzarella"]
    },
    "bbq-chicken-smash": {
        name: "BBQ Chicken Smash",
        image: "chickenpiz.jpg",
        category: "Meat lovers",
        description: "Grilled chicken, smoky bacon, and red onion with BBQ sauce and mozzarella.",
        ingredients: ["grilled chicken", "bacon", "red onion", "BBQ sauce", "mozzarella"]
    },
    "garden-veggie": {
        name: "Garden Veggie",
        image: "viggies.jpg",
        category: "Plant-based",
        description: "A colorful garden mix of peppers, mushrooms, olives, onion, and tomato.",
        ingredients: ["peppers", "mushrooms", "olives", "onion", "tomato"]
    },
    "vegan-pesto": {
        name: "Vegan Pesto",
        image: "vegan.jpg",
        category: "Plant-based",
        description: "Basil pesto, plant-based cheese, and fresh vegetables on a vegan-friendly base.",
        ingredients: ["basil pesto", "plant-based cheese", "zucchini", "cherry tomato"]
    }
};

const params = new URLSearchParams(window.location.search);
const pizza = pizzas[params.get("pizza")];
const details = document.getElementById("pizza-details-content");
const notFound = document.getElementById("pizza-not-found");

if (pizza) {
    details.hidden = false;
    document.title = `${pizza.name} — Customize Your Pizza | PizzaSlice`;
    document.getElementById("pizza-name").textContent = pizza.name;
    document.getElementById("pizza-image").src = pizza.image;
    document.getElementById("pizza-image").alt = `${pizza.name} pizza`;
    document.getElementById("pizza-category").textContent = pizza.category;
    document.getElementById("pizza-description").textContent = pizza.description;
    document.getElementById("pizza-ingredients").textContent = pizza.ingredients.join(", ");

    const removableOptions = document.getElementById("removable-options");
    pizza.ingredients.forEach((ingredient) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");

        checkbox.type = "checkbox";
        checkbox.name = "remove";
        checkbox.value = ingredient;
        text.textContent = ingredient;
        label.append(checkbox, text);
        removableOptions.append(label);
    });

    const form = document.getElementById("pizza-order-form");
    const priceOutput = document.getElementById("pizza-price");
    const orderMessage = document.getElementById("order-message");
    const quantityInput = document.getElementById("pizza-quantity");
    const sizePrices = { XS: 20, M: 30, L: 40, XL: 50 };
    const extraPrice = 3;
    const premiumCrustPrice = 5;

    const getTotal = () => {
        const size = form.elements.namedItem("size").value;
        const extras = form.querySelectorAll('input[name="extra"]:checked').length;
        const premiumCrust = form.elements.namedItem("crust").value !== "Original";

        const unitPrice = sizePrices[size] + extras * extraPrice + (premiumCrust ? premiumCrustPrice : 0);
        return unitPrice * Number(quantityInput.value);
    };

    const updatePrice = () => {
        if (!quantityInput.validity.valid) {
            return;
        }

        priceOutput.textContent = `GH₵${getTotal()}`;
        orderMessage.textContent = "";
    };

    form.addEventListener("change", updatePrice);
    quantityInput.addEventListener("input", updatePrice);
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const order = {
            pizza: pizza.name,
            quantity: Number(quantityInput.value),
            size: form.elements.namedItem("size").value,
            dough: form.elements.namedItem("dough").value,
            crust: form.elements.namedItem("crust").value,
            extraToppings: Array.from(form.querySelectorAll('input[name="extra"]:checked'), (input) => input.value),
            removedIngredients: Array.from(form.querySelectorAll('input[name="remove"]:checked'), (input) => input.value),
            price: getTotal()
        };

        try {
            const cart = JSON.parse(localStorage.getItem("pizzasliceCart") || "[]");
            if (!Array.isArray(cart)) {
                throw new Error("Saved order data is invalid.");
            }

            cart.push(order);
            localStorage.setItem("pizzasliceCart", JSON.stringify(cart));
            orderMessage.classList.remove("order-error");
            orderMessage.textContent = `${order.pizza} (${order.size}) added to your order for GH₵${order.price}.`;
        } catch {
            orderMessage.classList.add("order-error");
            orderMessage.textContent = "We couldn’t save your order. Please check your browser storage and try again.";
        }
    });
} else {
    notFound.hidden = false;
}
