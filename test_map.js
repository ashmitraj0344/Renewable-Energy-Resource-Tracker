const http = require('http');

http.get('http://localhost:1000/api/projects', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('Got', data.length, 'projects');
      const mapped = data.map(p => ({
        id: p._id, name: p.name, type: p.energyType, location: p.locationId ? (p.locationId.name || p.locationId) : 'Unknown',
        capacity: p.capacityKW, price: p.pricePerKWh, status: p.status, createdBy: p.createdBy ? p.createdBy._id : null,
        generation: Math.round(p.capacityKW * 6.4), usage: Math.round(p.capacityKW * 3.6)
      }));
      console.log('Mapped successfully');
      console.log('Sample:', mapped[0]);
    } catch(e) {
      console.error(e);
    }
  });
}).on('error', e => console.error(e));
