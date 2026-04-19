const projects = [
    { id: 'PRJ001', type: 'solar', status: 'active', createdBy: 'USR001', name: 'Alpha Solar' }
];

const user = { id: 'USR001' };
const userRole = 'energy_provider';

function renderProjects() {
    console.log("Starting render");
    const filtered = projects.filter(p => true); // Mock filter
    filtered.forEach(p => {
        let btns = '';
        if(userRole === 'community_leader' || userRole === 'community leader') {
          btns += `<button class="btn-proj btn-invest" onclick="investProject('${p.id}', '${p.name.replace(/'/g, "\'")}', '${p.type}', ${100})">Invest</button>`;
        }
        const canEdit = (userRole === 'energy_provider' || userRole === 'energy provider') && (p.createdBy === user.id);
        const isAdmin = userRole.includes('admin');
        if(canEdit || isAdmin) {
            console.log("Can edit.");
        }
    });
    console.log("Render completed");
}

renderProjects();
