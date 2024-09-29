import os

from autokitteh.google import google_sheets_client


def get_room_list():
    sheet = google_sheets_client("sheets_conn").spreadsheets().values()
    rows = sheet.get(spreadsheetId=os.getenv("GOOGLE_SHEET_ID"), range="A:A").execute()
    return [cell[0] for cell in rows.get("values", []) if cell]
