const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Location = require('./models/Location');
const Project = require('./models/Project');

async function seedData() {
  await mongoose.connect('mongodb://localhost:27017/renewable_energy');
  console.log('Connected to DB for seeding...');

  await User.deleteMany({});
  await Location.deleteMany({});
  await Project.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const provider = new User({ _id: 'USR001', name: 'John Provider', email: 'john@provider.com', password, role: 'energy_provider', isVerified: true });
  const provider2 = new User({ _id: 'USR002', name: 'Alice Power', email: 'alice@power.com', password, role: 'energy_provider', isVerified: true });
  const communityAdmin = new User({ _id: 'USR003', name: 'Bob Admin', email: 'bob@admin.com', password, role: 'community_leader', isVerified: true });
  await User.insertMany([provider, provider2, communityAdmin]);

  const loc1 = new Location({ _id: 'LOC001', name: 'Punjab Solar Park', state: 'Punjab', coordinates: { lat: 31.2, lng: 75.3 } });
  const loc2 = new Location({ _id: 'LOC002', name: 'Gujarat Wind Farm', state: 'Gujarat', coordinates: { lat: 23.2, lng: 72.3 } });
  await Location.insertMany([loc1, loc2]);

  const projects = [
    { _id: 'PRJ001', name: 'Alpha Solar', energyType: 'solar', locationId: 'LOC001', createdBy: 'USR001', capacityKW: 500, pricePerKWh: 4.5, status: 'active' },
    { _id: 'PRJ002', name: 'Beta Wind', energyType: 'wind', locationId: 'LOC002', createdBy: 'USR002', capacityKW: 1000, pricePerKWh: 3.8, status: 'active' },
    { _id: 'PRJ003', name: 'Gamma Solar', energyType: 'solar', locationId: 'LOC001', createdBy: 'USR001', capacityKW: 200, pricePerKWh: 4.6, status: 'active' },
    { _id: 'PRJ004', name: 'Delta Hydro', energyType: 'hydro', locationId: 'LOC002', createdBy: 'USR001', capacityKW: 800, pricePerKWh: 2.5, status: 'active' },
    { _id: 'PRJ005', name: 'Epsilon Biomass', energyType: 'biomass', locationId: 'LOC001', createdBy: 'USR002', capacityKW: 150, pricePerKWh: 5.1, status: 'active' },
    { _id: 'PRJ006', name: 'Zeta Wind', energyType: 'wind', locationId: 'LOC002', createdBy: 'USR001', capacityKW: 600, pricePerKWh: 3.9, status: 'active' },
    { _id: 'PRJ007', name: 'Eta Solar', energyType: 'solar', locationId: 'LOC001', createdBy: 'USR002', capacityKW: 400, pricePerKWh: 4.3, status: 'active' },
    { _id: 'PRJ008', name: 'Theta Hydro', energyType: 'hydro', locationId: 'LOC002', createdBy: 'USR001', capacityKW: 1200, pricePerKWh: 2.2, status: 'active' },
    { _id: 'PRJ009', name: 'Iota Biomass', energyType: 'biomass', locationId: 'LOC001', createdBy: 'USR002', capacityKW: 100, pricePerKWh: 5.5, status: 'inactive' },
    { _id: 'PRJ010', name: 'Kappa Solar', energyType: 'solar', locationId: 'LOC002', createdBy: 'USR001', capacityKW: 350, pricePerKWh: 4.8, status: 'inactive' }
  ];
  await Project.insertMany(projects);

  console.log('Database seeded successfully!');
  mongoose.connection.close();
}

seedData();
