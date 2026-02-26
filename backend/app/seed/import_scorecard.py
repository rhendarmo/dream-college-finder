from __future__ import annotations

import os
import math
import pandas as pd
from typing import Any

from sqlmodel import Session, select
from sqlalchemy.dialects.postgresql import insert

from app.db.session import engine
from app.models.school import School
from app.models.school_program import SchoolProgram

# Default to local project path, but allow override via env
DEFAULT_CSV_PATH = os.getenv(
    "SCORECARD_CSV_PATH",
    os.path.join(os.getcwd(), "data", "Most-Recent-Cohorts-Institution.csv"),
)

# Columns we want from Scorecard
CORE_COLS = [
    "UNITID",
    "INSTNM",
    "CITY",
    "STABBR",
    "ZIP",
    "LATITUDE",
    "LONGITUDE",
    "CONTROL",
    "ADM_RATE",
    "SAT_AVG",
    "ACTCMMID",
    "TUITIONFEE_IN",
    "TUITIONFEE_OUT",
    "UGDS",
    "C150_4",
    "C150_L4",
    "MD_EARN_WNE_P10",
    "INSTURL",
    "NPCURL",
]

# Program share columns
PCIP_COLS = [
    "PCIP01","PCIP03","PCIP04","PCIP05","PCIP09","PCIP10","PCIP11","PCIP12",
    "PCIP13","PCIP14","PCIP15","PCIP16","PCIP19","PCIP22","PCIP23","PCIP24",
    "PCIP25","PCIP26","PCIP27","PCIP29","PCIP30","PCIP31","PCIP32","PCIP33",
    "PCIP34","PCIP35","PCIP36","PCIP37","PCIP38","PCIP39","PCIP40","PCIP41",
    "PCIP42","PCIP43","PCIP44","PCIP45","PCIP46","PCIP47","PCIP48","PCIP49",
]

# Some Scorecard releases may omit a PCIP col or include slightly different set,
# so we will filter to those that exist in the CSV at runtime.


def _clean_num(v: Any):
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v


def _row_to_school_dict(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "unitid": int(row["UNITID"]),
        "name": str(row["INSTNM"]).strip(),
        "city": _clean_num(row.get("CITY")),
        "state": _clean_num(row.get("STABBR")),
        "zip": _clean_num(row.get("ZIP")),
        "latitude": _clean_num(row.get("LATITUDE")),
        "longitude": _clean_num(row.get("LONGITUDE")),
        "control": _clean_num(row.get("CONTROL")),
        "admission_rate": _clean_num(row.get("ADM_RATE")),
        "sat_avg": _clean_num(row.get("SAT_AVG")),
        "act_mid": _clean_num(row.get("ACTCMMID")),
        "tuition_in": _clean_num(row.get("TUITIONFEE_IN")),
        "tuition_out": _clean_num(row.get("TUITIONFEE_OUT")),
        "ug_enrollment": _clean_num(row.get("UGDS")),
        "grad_rate_4yr": _clean_num(row.get("C150_4")),
        "grad_rate_lt4": _clean_num(row.get("C150_L4")),
        "median_earnings_10yr": _clean_num(row.get("MD_EARN_WNE_P10")),
        "school_url": _clean_num(row.get("INSTURL")),
        "net_price_url": _clean_num(row.get("NPCURL")),
        # Keep a small subset of extra fields (optional)
        "raw_scorecard": {
            "REGION": _clean_num(row.get("REGION")),
            "LOCALE": _clean_num(row.get("LOCALE")),
            "PREDDEG": _clean_num(row.get("PREDDEG")),
            "HIGHDEG": _clean_num(row.get("HIGHDEG")),
        },
    }

def _batched(lst: list[Any], batch_size: int):
    for i in range(0, len(lst), batch_size):
        yield lst[i : i + batch_size]


def import_scorecard(csv_path: str = DEFAULT_CSV_PATH, chunksize: int = 5000) -> None:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Scorecard CSV not found at: {csv_path}\n"
            f"Set SCORECARD_CSV_PATH env var or place file at the default path."
        )

    print(f"Importing Scorecard from: {csv_path}")

    header_df = pd.read_csv(csv_path, nrows=1)
    existing_pcip = [c for c in PCIP_COLS if c in header_df.columns]
    usecols = [c for c in CORE_COLS if c in header_df.columns] + existing_pcip

    # Postgres bind param limit is 65535; stay under it with a buffer
    PG_MAX_PARAMS_SAFE = 60000

    total_rows = 0
    with Session(engine) as session:
        for chunk in pd.read_csv(csv_path, usecols=usecols, chunksize=chunksize, low_memory=False):
            chunk = chunk.where(pd.notnull(chunk), None)
            rows = chunk.to_dict(orient="records")

            # ---- Schools (UPSERT in safe batches) ----
            school_dicts = [_row_to_school_dict(r) for r in rows if r.get("UNITID") is not None]
            if school_dicts:
                cols_per_row = len(school_dicts[0].keys())
                # ensure at least 1 row per batch
                school_batch_size = max(1, PG_MAX_PARAMS_SAFE // cols_per_row)

                for batch in _batched(school_dicts, school_batch_size):
                    stmt = insert(School).values(batch)
                    update_cols = {
                        c: getattr(stmt.excluded, c)
                        for c in batch[0].keys()
                        if c != "unitid"
                    }
                    stmt = stmt.on_conflict_do_update(
                        index_elements=[School.unitid],
                        set_=update_cols,
                    )
                    session.exec(stmt)

                session.commit()

            # ---- Programs (delete then insert, also batched) ----
            unitids = [int(r["UNITID"]) for r in rows if r.get("UNITID") is not None]

            if unitids and existing_pcip:
                session.exec(
                    SchoolProgram.__table__.delete().where(SchoolProgram.school_unitid.in_(unitids))
                )
                session.commit()

                program_dicts: list[dict[str, Any]] = []
                for r in rows:
                    if r.get("UNITID") is None:
                        continue
                    u = int(r["UNITID"])
                    for col in existing_pcip:
                        share = r.get(col)
                        if share is None:
                            continue
                        try:
                            s = float(share)
                        except Exception:
                            continue
                        if s <= 0:
                            continue
                        cip2 = col.replace("PCIP", "")
                        program_dicts.append({"school_unitid": u, "cip2": cip2, "share": s})

                if program_dicts:
                    # 3 cols per row => can be large, but still batch safely
                    cols_per_row = 3
                    prog_batch_size = max(1, PG_MAX_PARAMS_SAFE // cols_per_row)

                    for batch in _batched(program_dicts, prog_batch_size):
                        stmt = insert(SchoolProgram).values(batch)
                        # optional: if you have a unique constraint on (school_unitid, cip2),
                        # you can use on_conflict_do_update/do_nothing. Otherwise just insert.
                        session.exec(stmt)

                    session.commit()

            total_rows += len(rows)
            print(f"Processed ~{total_rows} rows...")

    print("✅ Scorecard import complete.")


if __name__ == "__main__":
    import_scorecard()