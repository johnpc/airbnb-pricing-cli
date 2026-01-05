#!/bin/bash

# Load environment variables
source .env

echo "=== Test 1: Listings endpoint (shows sync is enabled) ==="
curl -s -X GET "https://api.pricelabs.co/v1/listings" \
  -H "accept: application/json" \
  -H "X-API-Key: ${PRICELABS_API_KEY}" | jq '.listings[0] | {id, push_enabled, last_date_pushed}'

echo -e "\n=== Test 2: Current pricing endpoint (fails with sync error) ==="
curl -s -X POST "https://api.pricelabs.co/v1/listing_prices" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${PRICELABS_API_KEY}" \
  -d "{\"listings\": [{\"id\": \"${PRICELABS_LISTING_ID}\", \"pms\": \"airbnb\"}]}" | jq '.'

echo -e "\n=== Test 3: Neighborhood data endpoint (fails with sync error) ==="
curl -s -X GET "https://api.pricelabs.co/v1/neighborhood_data?pms=airbnb&listing_id=${PRICELABS_LISTING_ID}" \
  -H "accept: application/json" \
  -H "X-API-Key: ${PRICELABS_API_KEY}" | jq '.'
