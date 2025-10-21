import csv
from pathlib import Path

# Paths
root = Path(__file__).resolve().parents[1]
input_path = root / 'data' / 'crash_data_queensland_1_crash_locations.csv'
output_path = root / 'data' / 'crash_data_queensland_1_crash_locations_trimmed.csv'

# Fields used in the dashboard
BASE_FIELDS = {
    'Crash_Ref_Number',
    'Crash_Severity',
    'Crash_Year',
    'Crash_Latitude',
    'Crash_Longitude',
    'Crash_Nature',
    'Crash_Type',
    'Loc_Suburb',
    'Loc_Local_Government_Area',
    'Crash_Day_Of_Week',
}

# Alternate names used in transforms
CASUALTY_ALTS = [
    'Count_Casualty_Total',
    'Total_Casualties',
    'Casualties',
    'Count Casualty Total',
    'count_casualty_total',
]
MONTH_ALTS = [
    'Crash_Month',
    'Crash Month',
    'Month',
    'month',
]


def main():
    if not input_path.exists():
        raise SystemExit(f"Input CSV not found: {input_path}")

    with input_path.open('r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []

        # Compute keep fields
        header_set = set(header)
        keep = []
        # keep base fields if present
        for field in BASE_FIELDS:
            if field in header_set:
                keep.append(field)
        # keep available month alternatives
        for field in MONTH_ALTS:
            if field in header_set and field not in keep:
                keep.append(field)
        # keep available casualty alternatives (at least one is required downstream)
        for field in CASUALTY_ALTS:
            if field in header_set and field not in keep:
                keep.append(field)

        if not keep:
            raise SystemExit("No matching fields found to keep. Check CSV header names.")

        # Re-open the original for a fresh reader and stream rows -> write trimmed copy
        with input_path.open('r', newline='', encoding='utf-8') as in_f, \
             output_path.open('w', newline='', encoding='utf-8') as out_f:
            reader2 = csv.DictReader(in_f)
            writer = csv.DictWriter(out_f, fieldnames=keep, extrasaction='ignore')
            writer.writeheader()
            for row in reader2:
                writer.writerow(row)

    print(f"Trimmed CSV written: {output_path}")
    print(f"Kept fields ({len(keep)}): {', '.join(keep)}")


if __name__ == '__main__':
    main()
