// Variant prices for each combination
const variantPrices = {
    "Regular|Milk Chocolate": 200, "Regular|Dark Chocolate": 225, "Regular|White Chocolate": 200,
    "Large|Milk Chocolate": 225, "Large|Dark Chocolate": 250, "Large|White Chocolate": 220,
    "Extra-Large|Milk Chocolate": 250, "Extra-Large|Dark Chocolate": 275, "Extra-Large|White Chocolate": 240
};

let totalPrice = 0;  // Initialize total price

// Toggle product description visibility
function toggleDescription() {
    const fullDescription = document.getElementById("fullDescription");
    const dots = document.getElementById("dots");
    const toggleButton = document.getElementById("toggleDescription");

    if (fullDescription.style.display === "none") {
        fullDescription.style.display = "inline";
        dots.style.display = "none";
        toggleButton.textContent = "Hide Details";
    } else {
        fullDescription.style.display = "none";
        dots.style.display = "inline";
        toggleButton.textContent = "Show Details";
    }
}

// Update quantity
function updateQuantity(change) {
    let quantity = Math.max(0, parseInt(document.getElementById("quantity").value) + change);
    document.getElementById("quantity").value = quantity;
    handleQuantityChange(quantity);
}

// Show dropdown options when quantity > 0
function handleQuantityChange(quantity) {
    const options = document.getElementById("options");
    if (quantity > 0) {
        options.style.display = "block";
    } else {
        options.style.display = "none"; // Hide options if quantity is 0
        resetOptions();
    }
}

// Enable Add button when both options are selected
function checkAddButton() {
    let addButton = document.getElementById("addButton");
    addButton.disabled = !document.getElementById("size").value || !document.getElementById("chocolateType").value;
}

// Add selected variant to list and update price
function addToVariantList() {
    let size = document.getElementById("size").value;
    let chocolateType = document.getElementById("chocolateType").value;
    let variantKey = `${size}|${chocolateType}`;

    if (variantPrices[variantKey]) {
        let variantList = document.getElementById("variantList");
        let variantItem = document.createElement("p");
        variantItem.textContent = `${variantList.children.length + 1}: ${size} | ${chocolateType} - ₹${variantPrices[variantKey]}`;
        variantList.appendChild(variantItem);

        totalPrice += variantPrices[variantKey];
        document.getElementById("totalPrice").textContent = `Total: ₹${totalPrice}`;
    }

    resetOptions();
    document.getElementById("options").style.display = "none"; // Hide dropdowns
}

// Reset options after adding
function resetOptions() {
    document.getElementById("size").selectedIndex = 0;
    document.getElementById("chocolateType").selectedIndex = 0;
    document.getElementById("addButton").disabled = true;
}

// Email validation regex
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Proceed to checkout (Validate email and integrate RazorPay)
async function proceedToCheckout() {
    let email = document.getElementById("email").value;
    
    if (isValidEmail(email)) {
        // Prepare order details
        let orderDetails = {
            email: email,
            totalPrice: totalPrice,
            items: []  // Collect items in the cart
        };

        // Collect items in the cart
        const variantList = document.getElementById("variantList");
        for (let i = 0; i < variantList.children.length; i++) {
            let item = variantList.children[i].textContent;
            orderDetails.items.push(item);
        }

        // Send the collected data to the backend using fetch
        try {
            const response = await fetch('https://my-flask-app-u15p.onrender.com/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderDetails)  // Send the order details as JSON
            });

            const data = await response.json();  // Parse response as JSON

            if (data.success) {
                // On success, notify the user and provide the download URL
                alert("Order details have been saved. You can download the file now.");
                
                // Create a download link for the file (the backend sends the file URL)
                let downloadLink = document.createElement("a");
                downloadLink.href = data.fileUrl;  // URL of the file from backend
                downloadLink.download = "order_details.txt";  // Name of the downloaded file
                downloadLink.click();  // Trigger the download
            } else {
                alert("There was an issue with processing your order.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred while processing your order.");
        }
    } else {
        alert("Please enter a valid email address.");
    }
}

// Check Add button when options change
document.getElementById("size").addEventListener("change", checkAddButton);
document.getElementById("chocolateType").addEventListener("change", checkAddButton);
