from __future__ import annotations

import html
import os
import zipfile
from datetime import date
from pathlib import Path


OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = OUTPUT_DIR / "daily-checkin-manual-test-cases.xlsx"


HEADERS = [
    "Test Case ID",
    "Module",
    "Scenario",
    "Preconditions",
    "Test Steps",
    "Test Data",
    "Expected Result",
    "Actual Result",
    "Status",
    "Priority",
    "Platform",
    "Owner",
    "Remarks",
]


TEST_CASES = [
    [
        "DC-001",
        "Home / Daily Check-in",
        "Daily check-in cards load for today's date",
        "User is logged in and has daily check-in habits configured.",
        "Open app > Go to Home tab > Keep selected date as Today.",
        "Date: Today",
        "Daily check-in section loads without error and shows available habits.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-002",
        "Home / Daily Check-in",
        "Change selected date and refresh habit list",
        "User is on Home tab.",
        "Tap tomorrow/yesterday/date chip in date scroller.",
        "Any visible date",
        "Habit list updates for selected date and section title matches selected date.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-003",
        "Home / Daily Check-in",
        "Open meditation daily check-in",
        "Meditation habit is visible on Home.",
        "Tap Meditation habit card.",
        "Meditation habit id and selected date",
        "Mindful Session screen opens with correct target minutes and no crash.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-004",
        "Meditation Check-in",
        "Meditation data loads from API",
        "User opened Mindful Session from daily check-in.",
        "Observe loading state, then loaded state.",
        "Valid meditation habit id/date",
        "Completed minutes, goal, streak, and trend are rendered from API response.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-005",
        "Meditation Check-in",
        "Error state supports retry",
        "API can be forced to fail or network is unavailable.",
        "Open Mindful Session > Wait for error > Tap Retry.",
        "Network/API failure",
        "Readable error appears; Retry calls API again and recovers when API succeeds.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-006",
        "Meditation Check-in",
        "Add 5 meditation minutes",
        "Meditation screen loaded and completed minutes are below goal.",
        "Tap +5m.",
        "Step: 5",
        "Increment API is called with 5 minutes; UI completed minutes increases by 5.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-007",
        "Meditation Check-in",
        "Prevent adding minutes beyond goal",
        "Completed minutes are close to or equal to daily goal.",
        "Tap a quick-add value that exceeds the remaining goal.",
        "Example: completed 12/15, tap +5m",
        "Warning toast appears and no increment API call is made.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-008",
        "Meditation Check-in",
        "Open reminder settings",
        "Meditation screen loaded.",
        "Tap settings icon in header.",
        "Reminder options",
        "Reminder settings modal opens with current selection highlighted.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-009",
        "Meditation Check-in",
        "Update reminder frequency",
        "Reminder modal is open.",
        "Select another reminder frequency.",
        "Example: every 30 minutes",
        "Reminder update API is called; success toast appears; selected option updates.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-010",
        "Meditation Check-in",
        "Hold anchor opens Presence Anchor",
        "Meditation screen loaded.",
        "Long-press Hold to anchor button.",
        "Hold duration: 650ms+",
        "Presence Anchor screen opens and receives goal, date, checkInId, and autoStart=true.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-011",
        "Presence Anchor",
        "Presence timer auto-starts after anchor hold",
        "User navigated from Meditation Check-in by holding anchor.",
        "Observe Presence Field circle and floating bottom player.",
        "autoStart=true",
        "Timer starts automatically; circle counter and bottom floating timer begin from same elapsed time.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-012",
        "Presence Anchor",
        "Play Timer button starts timer manually",
        "Open Presence Anchor with autoStart=false or stop current session.",
        "Tap Play Timer.",
        "Goal: 15 minutes",
        "Presence Field circle starts animating and bottom floating player appears/runs.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-013",
        "Presence Anchor",
        "Pause timer syncs completed minutes",
        "Presence Anchor timer is running from Daily Check-in.",
        "Wait around 2 minutes 18 seconds > Tap Pause Timer or floating pause.",
        "Elapsed: ~2:18",
        "Increment API is called with decimal minutes around 2.3; timer pauses in both circle and floating player.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-014",
        "Presence Anchor",
        "Resume after pause continues from same time",
        "Presence Anchor timer is paused.",
        "Tap Play Timer or floating play.",
        "Previous elapsed: ~2:18",
        "Timer resumes from previous elapsed value; no reset occurs.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-015",
        "Presence Anchor",
        "Stop timer syncs only remaining unsynced time",
        "Timer was paused once and then resumed.",
        "Pause at ~2.3m > Resume > Stop at ~3.0m.",
        "Elapsed delta after pause: ~0.7m",
        "Stop API call sends only unsynced delta, not total duration again.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-016",
        "Presence Anchor",
        "Circle counter and bottom timer stay synchronized",
        "Presence Anchor timer is running.",
        "Compare Presence Field center timer with bottom floating player timer for 30 seconds.",
        "Any active anchor session",
        "Both timers display the same elapsed and goal format, for example 2:18 / 15:00.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-017",
        "Presence Anchor",
        "Completion cue triggers at goal",
        "Presence Anchor timer is near goal or goal is set low for testing.",
        "Let timer reach goal.",
        "Goal: 5-15 minutes",
        "Success haptic/sound cue triggers once and progress does not exceed goal display.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-018",
        "Presence Anchor",
        "Open Guided Meditation from anchor",
        "Presence Anchor screen is open.",
        "Tap Guided Meditation suggestion.",
        "source/checkInId/date from Daily Check-in",
        "Meditation library opens and preserves Daily Check-in route context.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-019",
        "Presence Anchor",
        "Open Soundscape from anchor",
        "Presence Anchor screen is open.",
        "Tap Soundscape suggestion.",
        "source/checkInId/date from Daily Check-in",
        "Soundscape library opens and preserves Daily Check-in route context.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-020",
        "Meditation Library",
        "Open meditation detail from Daily Check-in context",
        "Meditation library was opened from Presence Anchor.",
        "Tap any meditation card.",
        "source=daily-checkin",
        "Meditation detail opens and retains source, checkInId, and date params.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-021",
        "Meditation Player",
        "Start meditation from Daily Check-in context",
        "Meditation detail opened from Daily Check-in context.",
        "Tap Start Meditation.",
        "Valid meditation content",
        "Meditation player opens, starts playback automatically, creates wellness session, and floating player appears.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-022",
        "Meditation Player",
        "Floating pause controls meditation playback",
        "Meditation audio is playing.",
        "Tap pause in bottom floating player.",
        "Active meditation session",
        "Audio pauses and floating status changes to Paused.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-023",
        "Meditation Player",
        "Floating resume controls meditation playback",
        "Meditation session is paused.",
        "Tap play in bottom floating player.",
        "Paused meditation session",
        "Audio resumes and floating status changes to Running.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-024",
        "Soundscape Library",
        "Open soundscape detail from Daily Check-in context",
        "Soundscape library was opened from Presence Anchor.",
        "Tap any soundscape card.",
        "source=daily-checkin",
        "Soundscape detail opens and retains source, checkInId, and date params.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-025",
        "Soundscape Player",
        "Start soundscape from Daily Check-in context",
        "Soundscape detail opened from Daily Check-in context.",
        "Tap Start Soundscape.",
        "Valid soundscape content",
        "Soundscape player opens, starts playback automatically, creates wellness session, and floating player appears.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-026",
        "Water Check-in",
        "Water check-in data loads",
        "Water habit exists on selected date.",
        "Open Water check-in from Home.",
        "Valid water habit id/date",
        "Water progress, weekly trend, tips, and settings action render without error.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-027",
        "Water Check-in",
        "Slider drag updates water amount before commit",
        "Water screen loaded with current progress.",
        "Drag hydration slider upward without releasing.",
        "Current: 500 ml; drag to 1000 ml",
        "Hero card updates visually while dragging; no success toast appears until slider is released.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-028",
        "Water Check-in",
        "Water increment API sends ml delta",
        "Water screen loaded with metric unit ml and committed amount.",
        "Move slider from current value to a higher value and release.",
        "Current: 500 ml; release at 800 ml",
        "Increment API is called with date=today and increment_by=300; success toast appears; committed value becomes 800 ml.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-029",
        "Water Check-in",
        "Water increment API converts ml delta to liters",
        "Water screen loaded for a habit whose backend metric unit is liter/liters.",
        "Move slider upward by 300 ml and release.",
        "Delta: 300 ml; Unit: liter",
        "Increment API is called with increment_by=0.3; success toast appears; UI remains in ml display.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-030",
        "Water Check-in",
        "Prevent negative water delta on lower drag",
        "Water screen has committed amount.",
        "Move control below committed amount and release.",
        "Committed value > selected value",
        "UI reverts to committed amount and no negative increment API call is made.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-031",
        "Water Check-in",
        "Water increment API failure rolls back UI",
        "Water screen loaded and API/network failure can be simulated.",
        "Move slider upward and release while increment API fails.",
        "Example delta: 250 ml",
        "Error toast appears; committed ref is restored; visible water amount returns to previous committed value.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-032",
        "Water Reminder Settings",
        "Open water reminder settings modal",
        "Water screen loaded.",
        "Tap settings icon in the Hydration header.",
        "Reminder options configured in app",
        "Hydration reminders modal opens and shows Ritual frequency option.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-033",
        "Water Reminder Settings",
        "Update water reminder frequency",
        "Hydration reminder modal is open.",
        "Tap Ritual frequency > Select a different frequency.",
        "Example: Every 30 minutes",
        "Reminder update API is called with reminder_frequency=30; success toast appears; selected reminder updates.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-034",
        "Water Reminder Settings",
        "Water reminder update API failure",
        "Hydration reminder modal is open and API/network failure can be simulated.",
        "Select a different reminder frequency.",
        "Example: Every 45 minutes",
        "Error toast appears; selected reminder should not change unless server accepts the update.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-035",
        "Sleep Check-in",
        "Sleep check-in data loads",
        "Sleep habit exists on selected date.",
        "Open Sleep check-in from Home.",
        "Valid sleep habit id/date",
        "Sleep performance, weekly pattern, tips, and settings action render without error.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-036",
        "Sleep Increment",
        "Start live sleep tracking",
        "Sleep screen loaded.",
        "Tap Sleep now.",
        "Current time",
        "Info toast appears with started time; button state changes so user can wake/complete later.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-037",
        "Sleep Increment",
        "Complete live sleep session calls increment API",
        "Live sleep tracking was started earlier.",
        "Wait/test with elapsed duration > 0 > Tap Wake up/complete sleep.",
        "Elapsed example: 2.25 hours",
        "Increment API is called with date=today and increment_by=2.25; success toast appears; sleep data reloads.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-038",
        "Sleep Increment",
        "Live sleep duration is capped at 8 hours",
        "Live sleep tracking duration exceeds target or can be mocked.",
        "Complete the sleep session.",
        "Elapsed example: 9 hours",
        "Increment API sends increment_by=8 maximum; UI reloads with capped sleep progress.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-039",
        "Sleep Increment",
        "Invalid live sleep duration shows warning",
        "Sleep tracking was started and completed immediately with no meaningful elapsed time.",
        "Tap Sleep now > immediately tap Wake up/complete.",
        "Elapsed: 0 hours",
        "Warning toast appears; increment API is not called for zero/invalid duration.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-040",
        "Sleep Increment",
        "Add past sleep session manually",
        "Sleep screen loaded.",
        "Open past/manual sleep log > Select bed time and wake time > Save.",
        "Bed: 11:00 PM; Wake: 7:15 AM",
        "Duration is calculated; increment API is called with sleep date and decimal hours; success toast appears; sleep data reloads.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-041",
        "Sleep Increment",
        "Past sleep save API failure",
        "Manual sleep log is open and API/network failure can be simulated.",
        "Select valid bed/wake time > Save.",
        "Any valid manual range",
        "Error toast appears; modal remains recoverable; sleep progress does not falsely update after reload.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-042",
        "Sleep Reminder Settings",
        "Open sleep reminder settings modal",
        "Sleep screen loaded.",
        "Tap settings icon in Nidra Sync header.",
        "Reminder and circadian options available",
        "Nidra Sync reminders modal opens with Ritual frequency and Circadian alignment options.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-043",
        "Sleep Reminder Settings",
        "Update sleep reminder frequency",
        "Sleep reminder modal is open.",
        "Tap Ritual frequency > Select a different frequency.",
        "Example: Every 30 minutes",
        "Reminder update API is called with reminder_frequency=30; success toast appears; selected value updates.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-044",
        "Sleep Reminder Settings",
        "Sleep reminder update API failure",
        "Sleep reminder modal is open and API/network failure can be simulated.",
        "Select a different reminder frequency.",
        "Example: Every 45 minutes",
        "Error toast appears; selected reminder should not change unless server accepts the update.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-045",
        "Sleep Time Settings",
        "Open circadian alignment settings",
        "Sleep reminder settings modal is open.",
        "Tap Circadian alignment.",
        "Current bed/wake values from API",
        "Circadian alignment sheet opens and displays current bed and wake window.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-046",
        "Sleep Time Settings",
        "Update bed time in circadian control",
        "Circadian alignment sheet is open.",
        "Drag/tap bed handle to a new time.",
        "Example: 10:30 PM",
        "Bed time label updates immediately; sleep window duration recalculates; no crash or overlap occurs.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-047",
        "Sleep Time Settings",
        "Update wake time in circadian control",
        "Circadian alignment sheet is open.",
        "Drag/tap wake handle to a new time.",
        "Example: 6:45 AM",
        "Wake time label updates immediately; sleep window duration recalculates; visual handles stay within clock.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-048",
        "Sleep Time Settings",
        "Sleep time changes after close/reopen",
        "Circadian alignment sheet is open and bed/wake values were changed.",
        "Close settings > Reopen settings > Open Circadian alignment again.",
        "Changed bed/wake values",
        "Changed bed and wake values remain visible for the current screen session. If backend persistence is required, confirm PATCH endpoint behavior with product/API owner.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-049",
        "Sleep Time Settings",
        "Sleep time controls on small device",
        "Run app on a small mobile viewport/device.",
        "Open Nidra Sync settings > Circadian alignment > Adjust bed and wake handles.",
        "Small screen device",
        "Clock controls, labels, close button, and bottom content remain visible and tappable without overlap.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-050",
        "Sleep Pattern",
        "Sleep weekly chart refreshes after increment",
        "Sleep session or past sleep has been saved.",
        "Observe Sleep Pattern card after success reload.",
        "Saved sleep duration",
        "Weekly pattern reflects latest progress for the saved date or remains consistent with backend response.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-051",
        "Cross-flow",
        "Water and sleep settings do not affect each other",
        "Both water and sleep habits exist.",
        "Update water reminder > Open sleep screen > Update sleep reminder.",
        "Different habit ids",
        "Each API call uses the correct habit id and only the relevant screen's selected reminder changes.",
        "",
        "Not Run",
        "High",
        "iOS / Android",
        "",
        "",
    ],
    [
        "DC-052",
        "Cross-flow",
        "Floating player does not block critical actions",
        "Any active meditation, anchor, or soundscape session.",
        "Navigate between Home, Meditation, Soundscape, and detail screens.",
        "Active floating player",
        "Floating player remains visible when expected and does not cover primary buttons or tab navigation.",
        "",
        "Not Run",
        "Medium",
        "iOS / Android",
        "",
        "",
    ],
]


def col_name(index: int) -> str:
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def cell_xml(row: int, col: int, value, style: int = 0, formula: str | None = None) -> str:
    ref = f"{col_name(col)}{row}"
    style_attr = f' s="{style}"' if style else ""
    if formula is not None:
      return f'<c r="{ref}"{style_attr}><f>{html.escape(formula)}</f></c>'
    if value is None or value == "":
        return f'<c r="{ref}"{style_attr}/>'
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"{style_attr}><v>{value}</v></c>'
    escaped = html.escape(str(value))
    return f'<c r="{ref}" t="inlineStr"{style_attr}><is><t>{escaped}</t></is></c>'


def row_xml(row_num: int, values, style: int = 0, height: int | None = None) -> str:
    height_attr = f' ht="{height}" customHeight="1"' if height else ""
    cells = "".join(cell_xml(row_num, col, value, style) for col, value in enumerate(values, 1))
    return f'<row r="{row_num}"{height_attr}>{cells}</row>'


def build_summary_sheet() -> str:
    rows = [
        '<row r="1" ht="30" customHeight="1">'
        + cell_xml(1, 1, "Daily Check-in Manual Test Cases", 1)
        + "</row>",
        row_xml(2, [f"Generated: {date.today().isoformat()}"], 2, 22),
        row_xml(4, ["Metric", "Count"], 3, 22),
        '<row r="5">' + cell_xml(5, 1, "Total Test Cases", 4) + cell_xml(5, 2, None, 4, "COUNTA('Daily Check-in Test Cases'!A2:A200)") + "</row>",
        '<row r="6">' + cell_xml(6, 1, "Passed", 4) + cell_xml(6, 2, None, 4, 'COUNTIF(\'Daily Check-in Test Cases\'!I2:I200,"Pass")') + "</row>",
        '<row r="7">' + cell_xml(7, 1, "Failed", 4) + cell_xml(7, 2, None, 4, 'COUNTIF(\'Daily Check-in Test Cases\'!I2:I200,"Fail")') + "</row>",
        '<row r="8">' + cell_xml(8, 1, "Blocked", 4) + cell_xml(8, 2, None, 4, 'COUNTIF(\'Daily Check-in Test Cases\'!I2:I200,"Blocked")') + "</row>",
        '<row r="9">' + cell_xml(9, 1, "Not Run", 4) + cell_xml(9, 2, None, 4, 'COUNTIF(\'Daily Check-in Test Cases\'!I2:I200,"Not Run")') + "</row>",
        row_xml(11, ["How to use", "Fill Actual Result, Status, Owner, and Remarks during manual testing. Use Status dropdown values: Pass, Fail, Blocked, Not Run."], 5, 42),
        row_xml(12, ["API note", "For Presence Anchor, verify pause/stop calls increment progress using decimal minutes such as 2.3."], 5, 42),
    ]
    return worksheet_xml("Summary", rows, "A1:B12", cols=[(1, 34), (2, 92)], merge_cells=["A1:B1"])


def build_cases_sheet() -> str:
    rows = [row_xml(1, HEADERS, 3, 28)]
    for idx, case in enumerate(TEST_CASES, 2):
        rows.append(row_xml(idx, case, 4, 64))

    return worksheet_xml(
        "Daily Check-in Test Cases",
        rows,
        f"A1:M{len(TEST_CASES) + 1}",
        cols=[
            (1, 13),
            (2, 22),
            (3, 34),
            (4, 42),
            (5, 52),
            (6, 28),
            (7, 54),
            (8, 30),
            (9, 14),
            (10, 12),
            (11, 16),
            (12, 18),
            (13, 30),
        ],
        freeze_pane=True,
        auto_filter=f"A1:M{len(TEST_CASES) + 1}",
        data_validations=[
            ('I2:I200', '"Pass,Fail,Blocked,Not Run"'),
            ('J2:J200', '"High,Medium,Low"'),
        ],
    )


def worksheet_xml(
    sheet_name: str,
    rows,
    dimension: str,
    cols,
    merge_cells=None,
    freeze_pane=False,
    auto_filter=None,
    data_validations=None,
) -> str:
    cols_xml = "<cols>" + "".join(
        f'<col min="{idx}" max="{idx}" width="{width}" customWidth="1"/>'
        for idx, width in cols
    ) + "</cols>"
    pane_xml = ""
    if freeze_pane:
        pane_xml = (
            '<sheetViews><sheetView workbookViewId="0">'
            '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
            "</sheetView></sheetViews>"
        )
    merge_xml = ""
    if merge_cells:
        merge_xml = f'<mergeCells count="{len(merge_cells)}">' + "".join(
            f'<mergeCell ref="{ref}"/>' for ref in merge_cells
        ) + "</mergeCells>"
    filter_xml = f'<autoFilter ref="{auto_filter}"/>' if auto_filter else ""
    validation_xml = ""
    if data_validations:
        validation_xml = f'<dataValidations count="{len(data_validations)}">'
        for sqref, formula in data_validations:
            validation_xml += (
                f'<dataValidation type="list" allowBlank="1" sqref="{sqref}">'
                f"<formula1>{html.escape(formula)}</formula1>"
                "</dataValidation>"
            )
        validation_xml += "</dataValidations>"

    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="{dimension}"/>
  {pane_xml}
  {cols_xml}
  <sheetData>{''.join(rows)}</sheetData>
  {filter_xml}
  {merge_xml}
  {validation_xml}
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>'''


def build_styles() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="11"/><color rgb="FF1F2933"/><name val="Calibri"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><i/><sz val="11"/><color rgb="FF4B5563"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><sz val="10"/><color rgb="FF111827"/><name val="Calibri"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF243126"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFA3BE8C"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAF7"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEAF3E4"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD6DED0"/></left>
      <right style="thin"><color rgb="FFD6DED0"/></right>
      <top style="thin"><color rgb="FFD6DED0"/></top>
      <bottom style="thin"><color rgb="FFD6DED0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''


def write_xlsx() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    files = {
        "[Content_Types].xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>''',
        "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>''',
        "xl/_rels/workbook.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''',
        "xl/workbook.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView activeTab="1"/></bookViews>
  <sheets>
    <sheet name="Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Daily Check-in Test Cases" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>''',
        "xl/worksheets/sheet1.xml": build_summary_sheet(),
        "xl/worksheets/sheet2.xml": build_cases_sheet(),
        "xl/styles.xml": build_styles(),
        "docProps/core.xml": f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Daily Check-in Manual Test Cases</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{date.today().isoformat()}T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{date.today().isoformat()}T00:00:00Z</dcterms:modified>
</cp:coreProperties>''',
        "docProps/app.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>2</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="2" baseType="lpstr"><vt:lpstr>Summary</vt:lpstr><vt:lpstr>Daily Check-in Test Cases</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>''',
    }

    with zipfile.ZipFile(OUTPUT_FILE, "w", zipfile.ZIP_DEFLATED) as zf:
        for arcname, content in files.items():
            zf.writestr(arcname, content)


if __name__ == "__main__":
    write_xlsx()
    print(OUTPUT_FILE)
