// Recommends available rental vehicles for a contact.
// Called from the Vehicle Recommender app card via hubspot.serverless().

const HUBSPOT_API = 'https://api.hubapi.com';
const VEHICLE_OBJECT = 'p_vehicles';
const LOCATION_OBJECT = 'p_locations';
const MAX_VEHICLE_PAGES = 5; // 500 vehicles max per request keeps us inside the 15s limit
const TOP_N = 3;
const VEHICLE_TYPES = [
  'Compact', 'Midsize', 'Fullsize', 'Standard', 'Coupe', 'Convertible',
  'SUV', 'Van', 'Truck', 'Premium', 'Luxury',
];

async function hubspotRequest(path, body) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot API ${res.status} on ${path}: ${text}`);
  }
  return res.json();
}

async function fetchAvailableVehicles() {
  const vehicles = [];
  let after;
  for (let page = 0; page < MAX_VEHICLE_PAGES; page++) {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'available', operator: 'EQ', value: 'true' }] }],
      properties: ['make', 'model', 'year', 'daily_price', 'odometer_reading', 'vin'],
      limit: 100,
    };
    if (after) body.after = after;
    const data = await hubspotRequest(`/crm/v3/objects/${VEHICLE_OBJECT}/search`, body);
    vehicles.push(...(data.results || []));
    after = data.paging?.next?.after;
    if (!after) break;
  }
  return vehicles;
}

async function fetchLocations() {
  const locations = [];
  let after;
  do {
    const body = {
      properties: ['full_address', 'address_1', 'city', 'state', 'postal_code'],
      limit: 100,
    };
    if (after) body.after = after;
    const data = await hubspotRequest(`/crm/v3/objects/${LOCATION_OBJECT}/search`, body);
    locations.push(...(data.results || []));
    after = data.paging?.next?.after;
  } while (after);
  return locations;
}

// Returns a map of vehicleId -> first associated locationId.
async function fetchVehicleLocationIds(vehicleIds) {
  const map = new Map();
  for (let i = 0; i < vehicleIds.length; i += 1000) {
    const chunk = vehicleIds.slice(i, i + 1000).map((id) => ({ id }));
    const data = await hubspotRequest(
      `/crm/v4/associations/${VEHICLE_OBJECT}/${LOCATION_OBJECT}/batch/read`,
      { inputs: chunk }
    );
    for (const row of data.results || []) {
      const target = row.to?.[0]?.toObjectId;
      if (target) map.set(String(row.from.id), String(target));
    }
  }
  return map;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function scoreVehicle(vehicle, { maxPrice, vehicleType, contactCity, contactState }) {
  const reasons = [];
  let score = 0;

  // Vehicle type fit (up to 40 points)
  if (vehicleType === 'any') {
    score += 20;
  } else if (vehicle.model === vehicleType) {
    score += 40;
    reasons.push(`Matches requested ${vehicleType.toLowerCase()} class`);
  }

  // Budget fit (up to 20 points, penalized when over budget)
  let overBudget = false;
  if (maxPrice == null) {
    score += 20;
  } else if (vehicle.dailyPrice <= maxPrice) {
    score += 20;
    reasons.push('Within daily budget');
  } else {
    overBudget = true;
    const overBy = (vehicle.dailyPrice - maxPrice) / maxPrice;
    score += Math.max(0, 20 - overBy * 40);
  }

  // Location proximity to the contact (up to 20 points)
  const city = (contactCity || '').trim().toLowerCase();
  const state = (contactState || '').trim().toUpperCase();
  if (city && vehicle.location?.city?.toLowerCase() === city) {
    score += 20;
    reasons.push(`At a location in ${vehicle.location.city}`);
  } else if (state && vehicle.location?.state === state) {
    score += 10;
    reasons.push(`In the contact's state (${state})`);
  }

  // Condition: lower odometer and newer model year (up to 20 points)
  if (vehicle.odometer != null) {
    score += 10 * (1 - Math.min(vehicle.odometer, 100000) / 100000);
    if (vehicle.odometer < 30000) reasons.push('Low mileage');
  }
  if (vehicle.year != null) {
    score += 10 * Math.min(Math.max((vehicle.year - 2015) / 10, 0), 1);
    if (vehicle.year >= 2022) reasons.push('Recent model year');
  }

  return { score: Math.round(score), reasons, overBudget };
}

exports.main = async (context = {}) => {
  try {
    const parameters = context.parameters || {};
    const contactProps = context.propertiesToSend || {};

    const vehicleType = VEHICLE_TYPES.includes(parameters.vehicleType) ? parameters.vehicleType : 'any';
    const maxPriceRaw = num(parameters.maxPrice);
    const maxPrice = maxPriceRaw && maxPriceRaw > 0 ? maxPriceRaw : null;

    const [vehicles, locations] = await Promise.all([fetchAvailableVehicles(), fetchLocations()]);

    const locationsById = new Map(
      locations.map((loc) => [
        String(loc.id),
        {
          id: String(loc.id),
          address: loc.properties.full_address || '',
          city: loc.properties.city || '',
          state: loc.properties.state || '',
        },
      ])
    );

    const vehicleLocations = await fetchVehicleLocationIds(vehicles.map((v) => String(v.id)));

    const candidates = vehicles
      .map((v) => {
        const locationId = vehicleLocations.get(String(v.id));
        const location = locationsById.get(locationId);
        return {
          id: String(v.id),
          make: v.properties.make || 'Unknown make',
          model: v.properties.model || 'Unknown',
          year: num(v.properties.year),
          dailyPrice: num(v.properties.daily_price),
          odometer: num(v.properties.odometer_reading),
          vinLast6: (v.properties.vin || '').slice(-6),
          location,
        };
      })
      .filter((v) => v.location && v.dailyPrice != null);

    const ranked = candidates
      .map((v) => ({ ...v, ...scoreVehicle(v, {
        maxPrice,
        vehicleType,
        contactCity: contactProps.city,
        contactState: contactProps.state,
      }) }))
      .sort((a, b) => b.score - a.score || a.dailyPrice - b.dailyPrice)
      .slice(0, TOP_N);

    return {
      ok: true,
      contact: {
        name: [contactProps.firstname, contactProps.lastname].filter(Boolean).join(' ') || null,
        city: contactProps.city || null,
        state: contactProps.state || null,
      },
      filters: { vehicleType, maxPrice },
      summary: {
        availableVehicles: vehicles.length,
        vehiclesWithLocation: candidates.length,
      },
      recommendations: ranked,
    };
  } catch (err) {
    console.error('getVehicleRecommendations failed:', err);
    return {
      ok: false,
      error: 'Could not load vehicle inventory. Please try again, or contact an admin if this keeps happening.',
    };
  }
};
