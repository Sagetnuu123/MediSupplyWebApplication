function fetchExpiredMedicines() {
  const medicinesRef = db.collection('medicine_storage');

  medicinesRef
    .where('pharmacyEmail', '==', pharmacyEmail)
    .where('pharmacyName', '==', pharmacyName)
    .where('expirationDate', '<', currentDate.toISOString())  // Filter by expired medicines (no time part)
    .orderBy('expirationDate', 'asc')  // Sort by expiration date (ascending)
    .limit(5)  // Limit to the first 5 rows
    .get()
    .then(snapshot => {
      const expiredMedicines = [];
      snapshot.forEach(doc => {
        expiredMedicines.push(doc.data());
      });

      updateMedicineTable(expiredMedicines);
    })
    .catch(error => {
      console.error("Error fetching expired medicines:", error);
    });
}

// Function to update the table
function updateMedicineTable(medicines) {
  const tableBody = document.getElementById('medicineTableBody');
  tableBody.innerHTML = '';  // Clear existing rows

  if (medicines.length === 0) {
    // No expired medicines found
    const noDataRow = document.createElement('tr');
    noDataRow.innerHTML = "<td colspan='5' style='text-align: center; color: red;'>No expired medicines found</td>";
    tableBody.appendChild(noDataRow);
  } else {
    medicines.forEach(medicine => {
      const row = document.createElement('tr');
      row.innerHTML = ` 
        <td>${medicine.brandName}</td>
        <td>${medicine.expirationDate}</td>
        <td>${medicine.stockQuantity}</td>
        <td>${medicine.supplier}</td>
        <td>${medicine.batchNumber}</td>
      `;
      tableBody.appendChild(row);
    });
  }
}

// Listen for new expired medicine entries with updated date filtering
db.collection('medicine_storage')
  .where('pharmacyEmail', '==', pharmacyEmail)
  .where('pharmacyName', '==', pharmacyName)
  .where('expirationDate', '<', currentDate.toISOString())  // Compare to the current date (no time)
  .onSnapshot(snapshot => {
    const expiredMedicines = [];
    snapshot.forEach(doc => {
      expiredMedicines.push(doc.data());
    });

    if (expiredMedicines.length > 5) {
      expiredMedicines.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)); // Sort by expiration date
      expiredMedicines.splice(5); // Keep only 5 rows
    }

    updateMedicineTable(expiredMedicines);
  });

// Initial load of expired medicines
fetchExpiredMedicines();