#!/usr/bin/env python3
"""PBA / Bernard — lead -> booking rate per funnel, from GHL.

Pulls all GHL contacts in a date window for the PBA location, then splits them by
funnel tag and counts how many carry the booking tag `call-booked`. Produces the
numbers behind docs/audits/2026-07-22-roadmap-vs-trademap-booking-rate.md.

Dependencies (external to this repo, on Ayaan's machine):
  ~/Projects/meta-ads-dashboard/ghl_client.py  (list_contacts_in_range)
  ~/Projects/meta-ads-dashboard/tz_util.py

Token: read from the PBA GHL env file (key GHL_PIT_BERNARD). Never hardcode it here.
Reading GHL is safe; CREATING a contact fires Bernard's live Slack + WhatsApp — this
script only reads.

Usage:  python3 scripts/pba-booking-rate.py [since YYYY-MM-DD] [until YYYY-MM-DD]
"""
import sys, pathlib
from collections import Counter

sys.path.insert(0, "/Users/ayaanarifaziz/Projects/meta-ads-dashboard")

LOCATION = "om6L4L1Zfk1cl0MLSbHM"   # PBA / Bernard GHL location
BOOKING_TAG = "call-booked"
# Prefer the canonical env; fall back to the credentials backup.
ENV_PATHS = [
    pathlib.Path.home() / ".config/advlaunch/bernard-ghl.env",
    pathlib.Path.home() / "Desktop/Claude_Backup/Credentials/advlaunch-env/bernard-ghl.env",
]

def load_token():
    for p in ENV_PATHS:
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k = k.strip(); v = v.strip().strip('"').strip("'")
            if k == "GHL_PIT_BERNARD" or "PIT" in k.upper() or "TOKEN" in k.upper():
                return v
    return None

def main():
    since = sys.argv[1] if len(sys.argv) > 1 else "2026-02-05"
    until = sys.argv[2] if len(sys.argv) > 2 else "2026-07-22"
    token = load_token()
    if not token:
        print("NO_TOKEN_FOUND — checked:", *[str(p) for p in ENV_PATHS], sep="\n  ")
        sys.exit(1)

    import ghl_client
    contacts = ghl_client.list_contacts_in_range(
        token, LOCATION, since, until,
        tz_name="Pacific/Auckland", booking_tags=[BOOKING_TAG], hard_cap=6000,
    )

    tagc = Counter(); booked_by_tag = Counter(); booked_total = 0
    for c in contacts:
        tags = {t.lower() for t in (c.get("tags") or [])}
        b = c.get("is_booked")
        if b:
            booked_total += 1
        for t in tags:
            tagc[t] += 1
            if b:
                booked_by_tag[t] += 1

    print(f"WINDOW {since} .. {until}  (Pacific/Auckland)")
    print("TOTAL_CONTACTS", len(contacts))
    print("BOOKED_TOTAL", booked_total)
    print("=== TAG | count | booked | book-rate ===")
    for t, ct in tagc.most_common(80):
        bk = booked_by_tag[t]
        rate = f"{bk / ct * 100:.1f}%" if ct else "-"
        print(f"{ct:5d} | {bk:4d} | {rate:>6} | {t}")

if __name__ == "__main__":
    main()
