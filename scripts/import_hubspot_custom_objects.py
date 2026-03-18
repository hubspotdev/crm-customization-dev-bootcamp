# pyright: reportAny=false, reportExplicitAny=false, reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownParameterType=false

import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib import error, request


API_BASE = "https://api.hubapi.com"
API_TOKEN = os.environ.get("HUBSPOT_API_TOKEN", "")

if not API_TOKEN:
    print("ERROR: Set the HUBSPOT_API_TOKEN environment variable before running this script.")
    print("  export HUBSPOT_API_TOKEN='pat-na1-...'")
    sys.exit(1)

LOCATIONS_OBJECT_TYPE_ID = "2-59332841"
VEHICLES_OBJECT_TYPE_ID = "2-59332851"

BATCH_SIZE = 100
API_DELAY_SECONDS = 0.5
DEFAULT_ASSOCIATION_TYPE_ID = 50


JsonObject = dict[str, Any]


def clean(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped else None


def chunks(items: list[JsonObject], chunk_size: int) -> list[list[JsonObject]]:
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]


def parse_json_object(raw_text: str) -> JsonObject:
    if not raw_text:
        return {}
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        return {"message": raw_text}
    if isinstance(parsed, dict):
        return parsed
    return {"data": parsed}


def api_request(method: str, path: str, payload: object | None = None) -> tuple[bool, int | None, JsonObject]:
    url = f"{API_BASE}{path}"
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = request.Request(
        url=url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json",
        },
    )

    try:
        with request.urlopen(req) as response:
            response_body = response.read().decode("utf-8")
            parsed = parse_json_object(response_body)
            return True, response.status, parsed
    except error.HTTPError as exc:
        raw_error = exc.read().decode("utf-8", errors="replace")
        parsed_error = parse_json_object(raw_error)
        return False, exc.code, parsed_error
    except error.URLError as exc:
        return False, None, {"message": str(exc)}


def build_location_inputs(csv_path: Path) -> list[JsonObject]:
    column_map = {
        "Full Address": "full_address",
        "Address 1": "address_1",
        "Address 2": "address_2",
        "City": "city",
        "State": "state",
        "Postal Code": "postal_code",
        "Lat": "lat",
        "Lng": "lng",
    }

    inputs = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for line_number, row in enumerate(reader, start=2):
            props = {}
            for csv_col, hs_prop in column_map.items():
                value = clean(row.get(csv_col))
                if value is not None:
                    props[hs_prop] = value

            if "full_address" not in props:
                print(f"WARNING: Skipping location row {line_number} with missing Full Address")
                continue

            inputs.append({"properties": props})

    return inputs


def build_vehicle_inputs(csv_path: Path) -> tuple[list[JsonObject], dict[str, str]]:
    column_map = {
        "VIN": "vin",
        "Make": "make",
        "Model": "model",
        "Daily Price": "daily_price",
        "Odometer Reading": "odometer_reading",
        "Year": "year",
    }

    inputs = []
    vin_to_current_location = {}

    with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for line_number, row in enumerate(reader, start=2):
            props = {}

            vin_value = clean(row.get("VIN"))
            if vin_value is None:
                print(f"WARNING: Skipping vehicle row {line_number} with missing VIN")
                continue
            props["vin"] = vin_value

            available_value = clean(row.get("Available"))
            if available_value is not None:
                lowered = available_value.lower()
                if lowered == "yes":
                    props["available"] = "true"
                elif lowered == "no":
                    props["available"] = "false"
                else:
                    props["available"] = lowered

            for csv_col, hs_prop in column_map.items():
                if hs_prop == "vin":
                    continue
                value = clean(row.get(csv_col))
                if value is not None:
                    props[hs_prop] = value

            current_location = clean(row.get("Current Location"))
            if current_location is not None:
                vin_to_current_location[vin_value] = current_location

            inputs.append({"properties": props})

    return inputs, vin_to_current_location


def batch_create_records(object_type_id: str, records: list[JsonObject], label: str) -> tuple[int, list[JsonObject]]:
    created_count = 0
    created_results: list[JsonObject] = []

    if not records:
        return created_count, created_results

    record_batches = chunks(records, BATCH_SIZE)
    total_batches = len(record_batches)

    for index, batch in enumerate(record_batches, start=1):
        ok, status, response_json = api_request(
            "POST",
            f"/crm/v3/objects/{object_type_id}/batch/create",
            payload={"inputs": batch},
        )

        if ok:
            results = response_json.get("results", [])
            created_count += len(results)
            created_results.extend(results)
            print(f"Created batch {index}/{total_batches} of {label} ({len(results)} records)")

            if response_json.get("numErrors"):
                print(
                    f"WARNING: {label} batch {index} returned errors: {response_json.get('errors', [])}"
                )
        else:
            message = response_json.get("message", "Unknown error")
            print(f"ERROR: Failed to create batch {index}/{total_batches} of {label} (status={status}): {message}")

        time.sleep(API_DELAY_SECONDS)

    return created_count, created_results


def discover_vehicle_to_location_association_type() -> int | None:
    ok, status, response_json = api_request(
        "GET",
        f"/crm/v4/associations/{VEHICLES_OBJECT_TYPE_ID}/{LOCATIONS_OBJECT_TYPE_ID}/labels",
    )

    if not ok:
        print(f"WARNING: Could not fetch association labels for vehicles->locations (status={status}): {response_json.get('message', 'Unknown error')}")
        return None

    labels = response_json.get("results", [])
    if not labels:
        print("WARNING: No association labels returned for vehicles->locations")
        return None

    def extract_type_id(label_obj: JsonObject) -> int | None:
        for key in ("associationTypeId", "typeId", "id"):
            value = label_obj.get(key)
            if value is not None:
                try:
                    return int(value)
                except (TypeError, ValueError):
                    return None
        return None

    for label_obj in labels:
        type_id = extract_type_id(label_obj)
        if type_id == DEFAULT_ASSOCIATION_TYPE_ID:
            return type_id

    for label_obj in labels:
        if label_obj.get("category") == "USER_DEFINED":
            type_id = extract_type_id(label_obj)
            if type_id is not None:
                return type_id

    fallback_type_id = extract_type_id(labels[0])
    return fallback_type_id


def create_vehicle_location_association(
    vehicle_id: str,
    location_id: str,
    association_type_id: int,
) -> tuple[bool, int | None, JsonObject]:
    return api_request(
        "PUT",
        f"/crm/v4/objects/{VEHICLES_OBJECT_TYPE_ID}/{vehicle_id}/associations/{LOCATIONS_OBJECT_TYPE_ID}/{location_id}",
        payload=[
            {
                "associationCategory": "USER_DEFINED",
                "associationTypeId": association_type_id,
            }
        ],
    )


def run() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    locations_csv = repo_root / "data" / "3.crm-bootcamp-locations.csv"
    vehicles_csv = repo_root / "data" / "3.crm-bootcamp-vehicles.csv"

    if not locations_csv.exists() or not vehicles_csv.exists():
        print("ERROR: Required CSV files are missing in data/")
        return 1

    location_inputs = build_location_inputs(locations_csv)
    vehicle_inputs, vin_to_current_location = build_vehicle_inputs(vehicles_csv)

    print(f"Loaded {len(location_inputs)} location rows from CSV")
    print(f"Loaded {len(vehicle_inputs)} vehicle rows from CSV")

    locations_created, location_results = batch_create_records(
        object_type_id=LOCATIONS_OBJECT_TYPE_ID,
        records=location_inputs,
        label="locations",
    )

    vehicles_created, vehicle_results = batch_create_records(
        object_type_id=VEHICLES_OBJECT_TYPE_ID,
        records=vehicle_inputs,
        label="vehicles",
    )

    location_by_full_address: dict[str, str] = {}
    for created in location_results:
        location_id = clean(created.get("id"))
        full_address = clean(created.get("properties", {}).get("full_address"))
        if location_id and full_address:
            location_by_full_address[full_address] = location_id

    association_type_id = DEFAULT_ASSOCIATION_TYPE_ID
    association_labels_checked = False

    associations_created = 0
    associations_failed = 0
    associations_skipped = 0

    total_vehicle_results = len(vehicle_results)
    for index, created_vehicle in enumerate(vehicle_results, start=1):
        vehicle_id = clean(created_vehicle.get("id"))
        vin = clean(created_vehicle.get("properties", {}).get("vin"))

        if vehicle_id is None or vin is None:
            associations_skipped += 1
            print(f"WARNING: Skipping association for created vehicle {index} due to missing id/vin")
            continue

        current_location = vin_to_current_location.get(vin)
        if current_location is None:
            associations_skipped += 1
            print(f"WARNING: No Current Location found for VIN {vin}; skipping association")
            continue

        location_id = location_by_full_address.get(current_location)
        if location_id is None:
            associations_skipped += 1
            print(
                f"WARNING: No matching created location for VIN {vin} and address '{current_location}'; skipping"
            )
            continue

        ok, status, response_json = create_vehicle_location_association(
            vehicle_id=vehicle_id,
            location_id=location_id,
            association_type_id=association_type_id,
        )

        if not ok and not association_labels_checked and association_type_id == DEFAULT_ASSOCIATION_TYPE_ID:
            association_labels_checked = True
            discovered_type_id = discover_vehicle_to_location_association_type()
            if discovered_type_id is not None and discovered_type_id != association_type_id:
                association_type_id = discovered_type_id
                print(f"Using discovered vehicles->locations associationTypeId: {association_type_id}")
                ok, status, response_json = create_vehicle_location_association(
                    vehicle_id=vehicle_id,
                    location_id=location_id,
                    association_type_id=association_type_id,
                )

        if ok:
            associations_created += 1
        else:
            associations_failed += 1
            print(f"WARNING: Failed association for VIN {vin} (status={status}): {response_json.get('message', 'Unknown error')}")

        if index % 50 == 0 or index == total_vehicle_results:
            print(f"Association progress: processed {index}/{total_vehicle_results}, created {associations_created}")

        time.sleep(API_DELAY_SECONDS)

    print("\nImport summary")
    print(f"Locations created: {locations_created}")
    print(f"Vehicles created: {vehicles_created}")
    print(f"Associations created: {associations_created}")
    print(f"Associations failed: {associations_failed}")
    print(f"Associations skipped: {associations_skipped}")

    return 0


if __name__ == "__main__":
    raise SystemExit(run())
