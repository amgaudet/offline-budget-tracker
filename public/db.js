let db;
//new db request for a "BudgetDB" database.
const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  // creates BudgetStore object
  db.createObjectStore('BudgetStore', { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

//error handler function
request.onerror = function (event) {
  console.log(event);
};

//open transaction on db and add record 
function saveRecord(record) {
  const transaction = db.transaction(['BudgetStore'], 'readwrite');
  const budgetTransaction = transaction.objectStore('BudgetStore');
  budgetTransaction.add(record);
}

//open transaction and get all records in db
function checkDatabase() {
  let transaction = db.transaction(['BudgetStore'], 'readwrite');
  const budgetTransaction = transaction.objectStore('BudgetStore');
  const getAll = budgetTransaction.getAll();

  //if any items present, we transfer to mongodb and clear
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          transaction = db.transaction(['BudgetStore'], 'readwrite');
          const refreshStore = transaction.objectStore('BudgetStore');
          refreshStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
