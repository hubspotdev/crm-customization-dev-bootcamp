import React, { useState } from 'react';
import {
  hubspot,
  Alert,
  Button,
  Divider,
  Flex,
  LoadingSpinner,
  Select,
  Tag,
  Text,
  Tile,
} from '@hubspot/ui-extensions';

const FUNCTION_NAME = 'get_vehicle_recommendations';

const BUDGET_OPTIONS = [
  { label: 'Any budget', value: 'any' },
  { label: 'Up to $75 / day', value: '75' },
  { label: 'Up to $100 / day', value: '100' },
  { label: 'Up to $150 / day', value: '150' },
  { label: 'Up to $250 / day', value: '250' },
];

const TYPE_OPTIONS = [
  { label: 'Any type', value: 'any' },
  { label: 'Compact', value: 'Compact' },
  { label: 'Midsize', value: 'Midsize' },
  { label: 'Fullsize', value: 'Fullsize' },
  { label: 'Standard', value: 'Standard' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Van', value: 'Van' },
  { label: 'Truck', value: 'Truck' },
  { label: 'Coupe', value: 'Coupe' },
  { label: 'Convertible', value: 'Convertible' },
  { label: 'Premium', value: 'Premium' },
  { label: 'Luxury', value: 'Luxury' },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const VehicleRecommender = () => {
  const [budget, setBudget] = useState('any');
  const [vehicleType, setVehicleType] = useState('any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hubspot.serverless(FUNCTION_NAME, {
        parameters: {
          maxPrice: budget === 'any' ? null : Number(budget),
          vehicleType,
        },
        propertiesToSend: ['firstname', 'lastname', 'city', 'state'],
      });
      if (!response || response.ok === false) {
        setError(response?.error || 'Something went wrong. Please try again.');
        setData(null);
      } else {
        setData(response);
      }
    } catch (err) {
      setError('Could not reach the recommendation service. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const recs = data?.recommendations || [];
  const contactName = data?.contact?.name;
  const contactCity = data?.contact?.city;
  const contactState = data?.contact?.state;
  const contactLocation = [contactCity, contactState].filter(Boolean).join(', ');

  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="xs">
        <Text format={{ fontWeight: 'bold' }}>Vehicle recommendation</Text>
        <Text variant="microcopy">
          {contactName
            ? `Matching available inventory for ${contactName}${contactLocation ? ` near ${contactLocation}` : ''}.`
            : 'Matching available inventory to this contact.'}
        </Text>
      </Flex>

      <Select
        label="Budget per day"
        name="budget"
        options={BUDGET_OPTIONS}
        value={budget}
        onChange={(value) => setBudget(value)}
      />
      <Select
        label="Vehicle type"
        name="vehicleType"
        options={TYPE_OPTIONS}
        value={vehicleType}
        onChange={(value) => setVehicleType(value)}
      />

      <Button variant="primary" onClick={getRecommendations} disabled={loading}>
        {loading ? 'Finding vehicles...' : 'Get recommendations'}
      </Button>

      {loading && (
        <Flex justify="center">
          <LoadingSpinner label="Loading recommendations" />
        </Flex>
      )}

      {error && (
        <Alert title="Unable to load recommendations" variant="danger">
          {error}
        </Alert>
      )}

      {!loading && !error && data && recs.length === 0 && (
        <Alert title="No matches" variant="warning">
          No available vehicles match these filters at locations with inventory. Try a wider budget or
          a different vehicle type.
        </Alert>
      )}

      {!loading && recs.length > 0 && (
        <>
          <Divider />
          <Text format={{ fontWeight: 'bold' }}>
            Top {recs.length} recommendation{recs.length === 1 ? '' : 's'}
          </Text>
          {recs.map((vehicle, index) => (
            <Tile key={vehicle.id}>
              <Flex direction="column" gap="xs">
                <Flex justify="between" align="center">
                  <Text format={{ fontWeight: 'bold' }}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                  {index === 0 ? <Tag variant="success">Best match</Tag> : null}
                </Flex>
                <Text>{currency.format(vehicle.dailyPrice)} / day</Text>
                <Text variant="microcopy">
                  {vehicle.odometer != null
                    ? `${vehicle.odometer.toLocaleString('en-US')} mi`
                    : 'Mileage unknown'}
                  {vehicle.vinLast6 ? ` · VIN ...${vehicle.vinLast6}` : ''}
                </Text>
                <Text variant="microcopy">Pickup: {vehicle.location.address}</Text>
                {vehicle.overBudget ? (
                  <Tag variant="warning">Above selected budget</Tag>
                ) : null}
                {vehicle.reasons.length > 0 && (
                  <Text variant="microcopy">{vehicle.reasons.join(' · ')}</Text>
                )}
              </Flex>
            </Tile>
          ))}
        </>
      )}
    </Flex>
  );
};

hubspot.extend(() => <VehicleRecommender />);
