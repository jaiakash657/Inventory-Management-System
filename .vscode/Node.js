document.addEventListener("DOMContentLoaded", () => {
    const inventoryTable = document.getElementById("inventory-table");
    const addItemForm = document.getElementById("addItemForm");

    const inventory = [];

    function displayInventory() {
        inventoryTable.innerHTML = '';
        inventory.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.expirationDate}</td>
                <td>${item.supplier}</td>
                <td><button onclick="deleteItem(${index})">Delete</button></td>
            `;
            inventoryTable.appendChild(row);
        });
    }

    function addItem(name, quantity, expirationDate, supplier) {
        inventory.push({
            name: name,
            quantity: quantity,
            expirationDate: expirationDate,
            supplier: supplier
        });
        displayInventory();
    }

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById("itemName").value;
        const quantity = document.getElementById("quantity").value;
        const expirationDate = document.getElementById("expirationDate").value;
        const supplier = document.getElementById("supplier").value;

        addItem(name, quantity, expirationDate, supplier);

        addItemForm.reset();
    });

    window.deleteItem = (index) => {
        inventory.splice(index, 1);
        displayInventory();
    };
});
