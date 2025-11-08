document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('tn_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  const customersSection = document.getElementById('customers-section');
  const ordersSection = document.getElementById('orders-section');
  const navCustomers = document.getElementById('nav-customers');
  const navOrders = document.getElementById('nav-orders');
  const customersList = document.getElementById('customers-list');
  const ordersList = document.getElementById('orders-list');
  const customerForm = document.getElementById('customer-form');
  const orderForm = document.getElementById('order-form');
  const saveCustomerBtn = document.getElementById('save-customer');
  const saveOrderBtn = document.getElementById('save-order');
  const addItemBtn = document.getElementById('add-item');
  const orderCustomerSelect = document.getElementById('order-customer');
  const statusFilter = document.getElementById('status-filter');
  const customerSearch = document.getElementById('customer-search');
  const searchBtn = document.getElementById('search-btn');
  const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
  const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));

  if (navCustomers) {
    navCustomers.addEventListener('click', function(e) {
      e.preventDefault();
      customersSection.style.display = 'block';
      ordersSection.style.display = 'none';
      navCustomers.classList.add('bg-indigo-50', 'text-indigo-600');
      navOrders.classList.remove('bg-indigo-50', 'text-indigo-600');
      loadCustomers();
    });
  }
  if (navOrders) {
    navOrders.addEventListener('click', function(e) {
      e.preventDefault();
      customersSection.style.display = 'none';
      ordersSection.style.display = 'block';
      navOrders.classList.add('bg-indigo-50', 'text-indigo-600');
      navCustomers.classList.remove('bg-indigo-50', 'text-indigo-600');
      loadOrders();
      loadCustomersForOrderSelect();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      loadCustomers(customerSearch.value);
    });
  }
  if (customerSearch) {
    customerSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') loadCustomers(customerSearch.value);
    });
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      loadOrders(this.value);
    });
  }
  if (addItemBtn) {
    addItemBtn.addEventListener('click', function() {
      const itemsContainer = document.getElementById('order-items');
      const newItem = document.createElement('div');
      newItem.className = 'order-item row mb-3';
      newItem.innerHTML = `
        <div class="col-md-5">
          <input type="text" class="form-control item-description" placeholder="Description" required>
        </div>
        <div class="col-md-3">
          <input type="text" class="form-control item-fabric" placeholder="Fabric">
        </div>
        <div class="col-md-2">
          <input type="number" class="form-control item-price" placeholder="Price" step="0.01" required>
        </div>
        <div class="col-md-2 d-flex">
          <input type="number" class="form-control item-quantity" placeholder="Qty" value="1" min="1">
          <button type="button" class="btn btn-sm btn-outline-danger ms-1 remove-item">×</button>
        </div>
      `;
      itemsContainer.appendChild(newItem);
      newItem.querySelector('.remove-item').addEventListener('click', function() {
        itemsContainer.removeChild(newItem);
      });
    });
  }
  if (saveCustomerBtn) {
    saveCustomerBtn.addEventListener('click', function() {
      if (!customerForm.checkValidity()) {
        customerForm.reportValidity();
        return;
      }
      const customerId = document.getElementById('customer-id').value;
      const customerData = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('customer-address').value,
        notes: document.getElementById('customer-notes').value,
        measurements: {
          bust: document.getElementById('measurement-bust').value || undefined,
          waist: document.getElementById('measurement-waist').value || undefined,
          hip: document.getElementById('measurement-hip').value || undefined,
          shoulder: document.getElementById('measurement-shoulder').value || undefined,
          sleeve: document.getElementById('measurement-sleeve').value || undefined,
          inseam: document.getElementById('measurement-inseam').value || undefined,
          neck: document.getElementById('measurement-neck').value || undefined,
          notes: document.getElementById('measurement-notes').value
        }
      };
      const method = customerId ? 'PUT' : 'POST';
      const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
      fetch(url, {
        method: method,
        headers: window.getAuthHeaders(),
        body: JSON.stringify(customerData)
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        customerModal.hide();
        loadCustomers();
        customerForm.reset();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error saving customer: ' + error.message);
      });
    });
  }
  if (saveOrderBtn) {
    saveOrderBtn.addEventListener('click', function() {
      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }
      const orderId = document.getElementById('order-id').value;
      const itemElements = document.querySelectorAll('.order-item');
      const items = Array.from(itemElements).map(item => ({
        description: item.querySelector('.item-description').value,
        fabric: item.querySelector('.item-fabric').value,
        price: parseFloat(item.querySelector('.item-price').value),
        quantity: parseInt(item.querySelector('.item-quantity').value)
      }));
      const orderData = {
        customer: document.getElementById('order-customer').value,
        items: items,
        totalAmount: parseFloat(document.getElementById('order-total').value),
        status: document.getElementById('order-status').value,
        paymentStatus: document.getElementById('payment-status').value,
        dueDate: document.getElementById('order-due-date').value,
        fittingDate: document.getElementById('fitting-date').value || undefined,
        notes: document.getElementById('order-notes').value
      };
      const method = orderId ? 'PUT' : 'POST';
      const url = orderId ? `/api/orders/${orderId}` : '/api/orders';
      fetch(url, {
        method: method,
        headers: window.getAuthHeaders(),
        body: JSON.stringify(orderData)
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        orderModal.hide();
        loadOrders();
        orderForm.reset();
        document.getElementById('order-items').innerHTML = `
          <div class="order-item row mb-3">
            <div class="col-md-5">
              <input type="text" class="form-control item-description" placeholder="Description" required>
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control item-fabric" placeholder="Fabric">
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control item-price" placeholder="Price" step="0.01" required>
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control item-quantity" placeholder="Qty" value="1" min="1">
            </div>
          </div>
        `;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error saving order: ' + error.message);
      });
    });
  }
  function apiFetch(url, opts = {}) {
    opts.headers = Object.assign({}, window.getAuthHeaders(), opts.headers || {});
    return fetch(url, opts).then(resp => {
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem('tn_token');
        window.location.href = '/login.html';
        throw new Error('Unauthorized');
      }
      return resp;
    });
  }
  function loadCustomers(searchTerm = '') {
    apiFetch(`/api/customers${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`)
      .then(response => response.json())
      .then(customers => {
        customersList.innerHTML = '';
        customers.forEach(customer => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="px-6 py-4">${customer.name}</td>
            <td class="px-6 py-4">${customer.phone}</td>
            <td class="px-6 py-4">${customer.email || ''}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 view-customer" data-id="${customer._id}">View</button>
                <button class="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 edit-customer" data-id="${customer._id}">Edit</button>
                <button class="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 delete-customer" data-id="${customer._id}">Delete</button>
                <button class="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 new-order" data-id="${customer._id}" data-name="${customer.name}">+ Order</button>
              </div>
            </td>
          `;
          customersList.appendChild(row);
        });
        document.querySelectorAll('.view-customer').forEach(btn => {
          btn.addEventListener('click', function() { viewCustomer(this.dataset.id); });
        });
        document.querySelectorAll('.edit-customer').forEach(btn => {
          btn.addEventListener('click', function() { editCustomer(this.dataset.id); });
        });
        document.querySelectorAll('.delete-customer').forEach(btn => {
          btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this customer?')) deleteCustomer(this.dataset.id);
          });
        });
        document.querySelectorAll('.new-order').forEach(btn => {
          btn.addEventListener('click', function() {
            createOrderForCustomer(this.dataset.id, this.dataset.name);
          });
        });
      })
      .catch(error => {
        console.error('Error loading customers:', error);
      });
  }
  function loadOrders(statusFilter = '') {
    apiFetch(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(response => response.json())
      .then(orders => {
        ordersList.innerHTML = '';
        orders.forEach(order => {
          const row = document.createElement('tr');
          const orderId = order._id.substring(order._id.length - 6).toUpperCase();
          const formattedDate = order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '';
          row.innerHTML = `
            <td class="px-6 py-4">${orderId}</td>
            <td class="px-6 py-4">${order.customer ? order.customer.name : 'Unknown'}</td>
            <td class="px-6 py-4">$${order.totalAmount.toFixed(2)}</td>
            <td class="px-6 py-4"><span class="badge ${order.status}">${order.status}</span></td>
            <td class="px-6 py-4">${formattedDate}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 view-order" data-id="${order._id}">View</button>
                <button class="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 edit-order" data-id="${order._id}">Edit</button>
                <button class="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 delete-order" data-id="${order._id}">Delete</button>
              </div>
            </td>
          `;
          ordersList.appendChild(row);
        });
        document.querySelectorAll('.view-order').forEach(btn => {
          btn.addEventListener('click', function() { viewOrder(this.dataset.id); });
        });
        document.querySelectorAll('.edit-order').forEach(btn => {
          btn.addEventListener('click', function() { editOrder(this.dataset.id); });
        });
        document.querySelectorAll('.delete-order').forEach(btn => {
          btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this order?')) deleteOrder(this.dataset.id);
          });
        });
      })
      .catch(error => {
        console.error('Error loading orders:', error);
      });
  }
  function loadCustomersForOrderSelect() {
    apiFetch('/api/customers')
      .then(r => r.json())
      .then(customers => {
        orderCustomerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
          const option = document.createElement('option');
          option.value = customer._id;
          option.textContent = customer.name;
          orderCustomerSelect.appendChild(option);
        });
      })
      .catch(err => console.error(err));
  }
  function viewCustomer(id) {
    apiFetch(`/api/customers/${id}`)
      .then(r => r.json())
      .then(customer => {
        customerForm.reset();
        document.getElementById('customer-id').value = customer._id;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-notes').value = customer.notes || '';
        if (customer.measurements) {
          document.getElementById('measurement-bust').value = customer.measurements.bust || '';
          document.getElementById('measurement-waist').value = customer.measurements.waist || '';
          document.getElementById('measurement-hip').value = customer.measurements.hip || '';
          document.getElementById('measurement-shoulder').value = customer.measurements.shoulder || '';
          document.getElementById('measurement-sleeve').value = customer.measurements.sleeve || '';
          document.getElementById('measurement-inseam').value = customer.measurements.inseam || '';
          document.getElementById('measurement-neck').value = customer.measurements.neck || '';
          document.getElementById('measurement-notes').value = customer.measurements.notes || '';
        }
        const formInputs = customerForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => input.setAttribute('readonly', true));
        saveCustomerBtn.style.display = 'none';
        document.getElementById('customerModalLabel').textContent = `Customer: ${customer.name}`;
        customerModal.show();
      })
      .catch(err => console.error(err));
  }
  function editCustomer(id) {
    apiFetch(`/api/customers/${id}`)
      .then(r => r.json())
      .then(customer => {
        customerForm.reset();
        document.getElementById('customer-id').value = customer._id;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-notes').value = customer.notes || '';
        if (customer.measurements) {
          document.getElementById('measurement-bust').value = customer.measurements.bust || '';
          document.getElementById('measurement-waist').value = customer.measurements.waist || '';
          document.getElementById('measurement-hip').value = customer.measurements.hip || '';
          document.getElementById('measurement-shoulder').value = customer.measurements.shoulder || '';
          document.getElementById('measurement-sleeve').value = customer.measurements.sleeve || '';
          document.getElementById('measurement-inseam').value = customer.measurements.inseam || '';
          document.getElementById('measurement-neck').value = customer.measurements.neck || '';
          document.getElementById('measurement-notes').value = customer.measurements.notes || '';
        }
        const formInputs = customerForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => input.removeAttribute('readonly'));
        saveCustomerBtn.style.display = 'block';
        document.getElementById('customerModalLabel').textContent = `Edit Customer: ${customer.name}`;
        customerModal.show();
      })
      .catch(err => console.error(err));
  }
  function deleteCustomer(id) {
    apiFetch(`/api/customers/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => loadCustomers())
      .catch(err => console.error(err));
  }
  function createOrderForCustomer(customerId, customerName) {
    orderForm.reset();
    document.getElementById('order-id').value = '';
    if (orderCustomerSelect.querySelector(`option[value="${customerId}"]`)) {
      orderCustomerSelect.value = customerId;
    } else {
      const option = document.createElement('option');
      option.value = customerId;
      option.textContent = customerName;
      orderCustomerSelect.appendChild(option);
      orderCustomerSelect.value = customerId;
    }
    document.getElementById('order-status').value = 'received';
    document.getElementById('payment-status').value = 'pending';
    document.getElementById('order-due-date').valueAsDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    document.getElementById('order-items').innerHTML = `
      <div class="order-item row mb-3">
        <div class="col-md-5">
          <input type="text" class="form-control item-description" placeholder="Description" required>
        </div>
        <div class="col-md-3">
          <input type="text" class="form-control item-fabric" placeholder="Fabric">
        </div>
        <div class="col-md-2">
          <input type="number" class="form-control item-price" placeholder="Price" step="0.01" required>
        </div>
        <div class="col-md-2">
          <input type="number" class="form-control item-quantity" placeholder="Qty" value="1" min="1">
        </div>
      </div>
    `;
    document.getElementById('orderModalLabel').textContent = `Create Order for ${customerName}`;
    orderModal.show();
    if (navOrders) navOrders.click();
  }
  function viewOrder(id) {
    apiFetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(order => {
        orderForm.reset();
        document.getElementById('order-id').value = order._id;
        if (order.customer && orderCustomerSelect.querySelector(`option[value="${order.customer._id}"]`)) {
          orderCustomerSelect.value = order.customer._id;
        } else if (order.customer) {
          const option = document.createElement('option');
          option.value = order.customer._id;
          option.textContent = order.customer.name;
          orderCustomerSelect.appendChild(option);
          orderCustomerSelect.value = order.customer._id;
        }
        document.getElementById('order-total').value = order.totalAmount.toFixed(2);
        document.getElementById('order-status').value = order.status;
        document.getElementById('payment-status').value = order.paymentStatus;
        document.getElementById('order-due-date').value = order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '';
        if (order.fittingDate) document.getElementById('fitting-date').value = new Date(order.fittingDate).toISOString().slice(0, 16);
        document.getElementById('order-notes').value = order.notes || '';
        const itemsContainer = document.getElementById('order-items');
        itemsContainer.innerHTML = '';
        order.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = 'order-item row mb-3';
          itemElement.innerHTML = `
            <div class="col-md-5">
              <input type="text" class="form-control item-description" value="${item.description}" readonly>
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control item-fabric" value="${item.fabric || ''}" readonly>
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control item-price" value="${item.price.toFixed(2)}" readonly>
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control item-quantity" value="${item.quantity}" readonly>
            </div>
          `;
          itemsContainer.appendChild(itemElement);
        });
        const formInputs = orderForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => input.setAttribute('disabled', true));
        saveOrderBtn.style.display = 'none';
        addItemBtn.style.display = 'none';
        document.getElementById('orderModalLabel').textContent = `Order Details`;
        orderModal.show();
      })
      .catch(err => console.error(err));
  }
  function editOrder(id) {
    apiFetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(order => {
        orderForm.reset();
        document.getElementById('order-id').value = order._id;
        if (order.customer && orderCustomerSelect.querySelector(`option[value="${order.customer._id}"]`)) {
          orderCustomerSelect.value = order.customer._id;
        } else if (order.customer) {
          const option = document.createElement('option');
          option.value = order.customer._id;
          option.textContent = order.customer.name;
          orderCustomerSelect.appendChild(option);
          orderCustomerSelect.value = order.customer._id;
        }
        document.getElementById('order-total').value = order.totalAmount.toFixed(2);
        document.getElementById('order-status').value = order.status;
        document.getElementById('payment-status').value = order.paymentStatus;
        document.getElementById('order-due-date').value = order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '';
        if (order.fittingDate) document.getElementById('fitting-date').value = new Date(order.fittingDate).toISOString().slice(0,16);
        document.getElementById('order-notes').value = order.notes || '';
        const itemsContainer = document.getElementById('order-items');
        itemsContainer.innerHTML = '';
        order.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = 'order-item row mb-3';
          itemElement.innerHTML = `
            <div class="col-md-5">
              <input type="text" class="form-control item-description" value="${item.description}" required>
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control item-fabric" value="${item.fabric || ''}">
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control item-price" value="${item.price.toFixed(2)}" step="0.01" required>
            </div>
            <div class="col-md-2 d-flex">
              <input type="number" class="form-control item-quantity" value="${item.quantity}" min="1">
              <button type="button" class="btn btn-sm btn-outline-danger ms-1 remove-item">×</button>
            </div>
          `;
          itemsContainer.appendChild(itemElement);
          itemElement.querySelector('.remove-item').addEventListener('click', function() {
            itemsContainer.removeChild(itemElement);
          });
        });
        const formInputs = orderForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => input.removeAttribute('disabled'));
        saveOrderBtn.style.display = 'block';
        addItemBtn.style.display = 'block';
        document.getElementById('orderModalLabel').textContent = `Edit Order`;
        orderModal.show();
      })
      .catch(err => console.error(err));
  }
  function deleteOrder(id) {
    apiFetch(`/api/orders/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => loadOrders())
      .catch(err => console.error(err));
  }
  loadCustomers();
});