const API_URL = 'http://localhost:1000/api';

// --- AUTH & STATE ---
function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return { token, user: user ? JSON.parse(user) : null };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function requireAuth() {
  const { user } = getAuth();
  if (!user) window.location.href = 'login.html';
  return user;
}

// --- DOM ELEMENTS & ROUTING ---
const path = window.location.pathname;
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userInfoElem = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const confirmPayBtn = document.getElementById('confirm-pay-btn');
const cancelPayBtn = document.getElementById('cancel-pay-btn');
const payProjectName = document.getElementById('pay-project-name');
const payProjectType = document.getElementById('pay-project-type');
const payAmount = document.getElementById('pay-amount');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.user);
        window.location.href = 'dashboard.html';
      } else {
        const err = document.getElementById('error-msg');
        err.innerText = data.error || 'Login failed';
        err.classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
      const err = document.getElementById('error-msg');
      if (err) {
        err.innerText = 'Unable to reach the server';
        err.classList.remove('hidden');
      }
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value,
      role: document.getElementById('role').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      password: document.getElementById('password').value,
    };
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.user);
        window.location.href = 'dashboard.html';
      } else {
        const err = document.getElementById('error-msg');
        err.innerText = data.error || 'Registration failed';
        err.classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
      const err = document.getElementById('error-msg');
      if (err) {
        err.innerText = 'Unable to reach the server';
        err.classList.remove('hidden');
      }
    }
  });
}

if (userInfoElem) {
  const user = requireAuth();
  document.getElementById('user-info').innerText = `${user.name} (${user.role.replace('_', ' ')})`;
  
  // Update welcome section
  const welcomeUser = document.getElementById('welcome-user');
  const welcomeRole = document.getElementById('welcome-role');
  if (welcomeUser) welcomeUser.innerText = user.name;
  if (welcomeRole) welcomeRole.innerText = user.role.replace('_', ' ');
  
  logoutBtn.addEventListener('click', logout);

  if (user.role === 'energy_provider') {
    document.getElementById('add-project-btn').classList.remove('hidden');
  }

  // Modals
  const modal = document.getElementById('project-modal');
  document.getElementById('add-project-btn').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));

  const editModal = document.getElementById('edit-project-modal');
  if (editModal) {
    document.getElementById('close-edit-modal-btn').addEventListener('click', () => editModal.classList.add('hidden'));

    document.getElementById('edit-project-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-p-id').value;
      const payload = {
        name: document.getElementById('edit-p-name').value,
        energyType: document.getElementById('edit-p-type').value,
        status: document.getElementById('edit-p-status').value,
        capacityKW: Number(document.getElementById('edit-p-capacity').value),
        pricePerKWh: Number(document.getElementById('edit-p-price').value),
      };
      
      try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          editModal.classList.add('hidden');
          loadProjects();
        } else {
          alert('Failed to update project');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Create Project
  document.getElementById('add-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('p-name').value,
      energyType: document.getElementById('p-type').value,
      locationId: document.getElementById('p-location').value,
      capacityKW: Number(document.getElementById('p-capacity').value),
      pricePerKWh: Number(document.getElementById('p-price').value),
      createdBy: user.id
    };
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      modal.classList.add('hidden');
      loadProjects();
    }
  });

  // Filters
  const fType = document.getElementById('filter-type');
  const fStatus = document.getElementById('filter-status');
  fType.addEventListener('change', loadProjects);
  fStatus.addEventListener('change', loadProjects);

  // Load Projects
  async function loadProjects() {
    let url = `${API_URL}/projects?`;
    if (fType.value) url += `energyType=${fType.value}&`;
    if (fStatus.value) url += `status=${fStatus.value}`;

    const res = await fetch(url);
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = "bg-white p-5 rounded-lg shadow border border-gray-100 transition hover:shadow-md";
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-bold text-lg">${p.name}</h4>
          <span class="text-xs uppercase font-bold px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded">${p.energyType}</span>
        </div>
        <p class="text-sm text-gray-600 mb-1"><strong>Provider:</strong> ${p.createdBy ? p.createdBy.name : 'Unknown'}</p>
        <p class="text-sm text-gray-600 mb-1"><strong>Location ID:</strong> ${p.locationId ? (p.locationId.name || p.locationId) : 'Unknown'}</p>
        <div class="mt-4 flex gap-4 text-sm bg-gray-50 p-2 rounded">
          <div><span class="block text-gray-500 text-xs">Capacity</span><strong>${p.capacityKW} KW</strong></div>
          <div><span class="block text-gray-500 text-xs">Rate</span><strong>₹${p.pricePerKWh}/KWh</strong></div>
        </div>
        <div class="mt-4 flex flex-col space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-semibold ${p.status === 'active' ? 'text-green-600' : 'text-red-500'}">&bull; ${p.status.toUpperCase()}</span>
            ${ user.role === 'community_leader' && p.status === 'active' ? 
              `<button onclick="initiateBuy('${p._id}', '${p.name.replace(/'/g, "\\'")}', '${p.energyType}', ${p.capacityKW * p.pricePerKWh})" class="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700">Buy / Invest</button>` : ''
            }
          </div>
          ${ user.role === 'energy_provider' && (p.createdBy && p.createdBy._id === user.id) ? 
            `<div class="flex justify-end space-x-2 border-t pt-2 mt-2">
               <button onclick="openEditModal('${p._id}', '${p.name.replace(/'/g, "\\'")}', '${p.energyType}', ${p.capacityKW}, ${p.pricePerKWh}, '${p.status}')" class="text-blue-500 hover:text-blue-700 text-xs px-3 py-1 border border-blue-500 rounded hover:bg-blue-50">Edit</button>
               <button onclick="deleteProject('${p._id}')" class="text-red-500 hover:text-red-700 text-xs px-3 py-1 border border-red-500 rounded hover:bg-red-50">Delete</button>
             </div>` : ''
          }
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Set this global for inline onclick
  window.initiateBuy = function(id, name, type, amount) {
    sessionStorage.setItem('buy_intent', JSON.stringify({ id, name, type, amount }));
    window.location.href = 'payment.html';
  }

  window.openEditModal = function(id, name, type, capacity, price, status) {
    document.getElementById('edit-p-id').value = id;
    document.getElementById('edit-p-name').value = name;
    document.getElementById('edit-p-type').value = type;
    document.getElementById('edit-p-capacity').value = capacity;
    document.getElementById('edit-p-price').value = price;
    document.getElementById('edit-p-status').value = status;
    document.getElementById('edit-project-modal').classList.remove('hidden');
  }

  window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
      if (res.ok) loadProjects();
      else alert('Failed to delete project');
    } catch (err) {
      console.error(err);
    }
  }

  loadProjects();
}

if (confirmPayBtn && cancelPayBtn && payProjectName && payProjectType && payAmount) {
  const user = requireAuth();
  const intent = JSON.parse(sessionStorage.getItem('buy_intent'));
  if (!intent) window.location.href = 'dashboard.html';

  payProjectName.innerText = intent.name;
  payProjectType.innerText = intent.type;
  payAmount.innerText = intent.amount.toFixed(2);

  cancelPayBtn.addEventListener('click', () => {
    sessionStorage.removeItem('buy_intent');
    window.location.href = 'dashboard.html';
  });

  confirmPayBtn.addEventListener('click', async () => {
    confirmPayBtn.innerText = 'Processing...';
    
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: user.id, projectId: intent.id, amountINR: intent.amount })
      });
      if (res.ok) {
        alert('Payment Successful!');
        sessionStorage.removeItem('buy_intent');
        window.location.href = 'dashboard.html';
      }
    } catch(err) {
      alert('Payment failed');
      console.error(err);
    } finally {
      confirmPayBtn.innerText = 'Pay Now';
    }
  });
}


if (path.includes('payment.html')) {
  const user = requireAuth();
  const intent = JSON.parse(sessionStorage.getItem('buy_intent'));
  if (!intent) window.location.href = 'dashboard.html';

  document.getElementById('pay-project-name').innerText = intent.name;
  document.getElementById('pay-project-type').innerText = intent.type;
  document.getElementById('pay-amount').innerText = intent.amount.toFixed(2);

  document.getElementById('cancel-pay-btn').addEventListener('click', () => {
    sessionStorage.removeItem('buy_intent');
    window.location.href = 'dashboard.html';
  });

  document.getElementById('confirm-pay-btn').addEventListener('click', async () => {
    document.getElementById('confirm-pay-btn').innerText = 'Processing...';
    
    // API Call
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: user.id, projectId: intent.id, amountINR: intent.amount })
      });
      if (res.ok) {
        alert('Payment Successful!');
        sessionStorage.removeItem('buy_intent');
        window.location.href = 'dashboard.html';
      }
    } catch(err) {
      alert('Payment failed');
    }
  });
}
