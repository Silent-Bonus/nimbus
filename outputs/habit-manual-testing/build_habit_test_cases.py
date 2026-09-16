from __future__ import annotations

import html
import zipfile
from datetime import date
from pathlib import Path


OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = OUTPUT_DIR / "habit-ui-manual-test-cases.xlsx"


HEADERS = [
    "Test Case ID",
    "Feature",
    "Scenario",
    "Preconditions",
    "Test Steps",
    "Test Data",
    "Expected Result",
    "API / Data Check",
    "Actual Result",
    "Status",
    "Priority",
    "Platform",
    "Owner",
    "Remarks",
]


TEST_CASES = [
    ["HAB-001", "Habit List", "Load habit list on Home", "User is logged in.", "Open app > Go to Home tab.", "Date: Today", "Habit list loads with protocol cards, progress count, icon, color, frequency, and metric.", "GET habit list is called with selected date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-002", "Habit List", "Empty habit list state", "User has no habits for selected date.", "Open Home tab for a date with no habits.", "Any empty date", "Empty state appears with create-habit friendly copy; app does not crash.", "GET habit list returns empty data array.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-003", "Habit List", "Date change refreshes list", "User has habits across dates.", "Tap another date in date scroller.", "Today, yesterday, tomorrow", "List refreshes and section title/progress count reflect selected date.", "GET habit list called with new yyyy-mm-dd date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-004", "Habit List", "Habit visual fallback displays correctly", "Habit exists without icon or color.", "Open Home and inspect habit card.", "Habit missing icon/color", "Card still shows a readable fallback icon/color based on habit name.", "Mapped item includes fallback icon/color before render.", "", "Not Run", "Low", "iOS / Android", "", ""],
    ["HAB-005", "Create Habit", "Open create habit screen", "User is logged in.", "Tap create/add habit entry point.", "N/A", "Create Habit screen opens with name, icon, type, metric, duration, date/frequency, reminder, and color controls.", "No create API call before submit.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-006", "Create Habit", "Create habit with valid all-day daily schedule", "Create screen is open.", "Enter habit name > Select type > Select metric > Select all-day duration > Select start date/frequency > Set reminder > Tap submit.", "Name: Morning Walk; Metric: 30 minutes; Frequency: daily; Reminder: 08:00", "Success toast appears and user returns to Home.", "POST create habit payload includes name, habit_type_id, habit_metric, all_day true, frequency, remind_at, color, icon.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-007", "Create Habit", "Created habit appears on Home", "Habit created successfully.", "Wait for Home navigation/reload.", "Created habit from HAB-006", "New habit card appears on selected date with correct name, metric, reminder/frequency details, icon, and color.", "GET habit list includes newly created habit.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-008", "Create Habit", "Create habit with custom duration window", "Create screen is open.", "Enter required fields > Choose start and end time duration > Submit.", "Start: 07:00; End: 08:00", "Habit saves successfully and duration details are retained.", "Payload sends start_time/end_time in backend time format, not all_day.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-009", "Create Habit", "Create habit with existing and new tags", "Create screen is open and tags are available.", "Select one existing tag > Add one new tag > Complete required fields > Submit.", "Old tag + New tag", "Habit creates successfully and selected tags are persisted.", "Payload sends tags.old as ids and tags.new with new value.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-010", "Create Habit", "Select emoji icon", "Create screen is open.", "Open emoji selector > Choose emoji > Submit valid habit.", "Emoji: any selected icon", "Selected emoji appears in form and on created habit card.", "Payload contains selected icon.", "", "Not Run", "Low", "iOS / Android", "", ""],
    ["HAB-011", "Create Habit", "Select color swatch", "Create screen is open.", "Tap each color swatch and observe selected state.", "Available color options", "Selected color is visibly highlighted and used on saved habit.", "Payload contains selected color hex.", "", "Not Run", "Low", "iOS / Android", "", ""],
    ["HAB-012", "Create Habit Validation", "Name is required", "Create screen is open.", "Leave name empty > Fill other required fields > Tap submit.", "Name: blank", "Validation toast says habit name is required; no navigation occurs.", "POST create habit is not called.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-013", "Create Habit Validation", "Metric is required", "Create screen is open.", "Enter name > Skip metric > Set reminder > Tap submit.", "Metric: blank", "Validation toast says metric is required.", "POST create habit is not called.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-014", "Create Habit Validation", "Reminder is required", "Create screen is open.", "Enter name and metric > Skip reminder > Tap submit.", "Reminder: blank", "Validation toast says reminder is required.", "POST create habit is not called.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-015", "Create Habit Error", "Create API failure shows error", "API/network failure can be simulated.", "Submit a valid habit while API fails.", "Network disabled or server 500", "Error toast appears; form remains available for correction/retry.", "POST create habit fails and error is handled.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-016", "Mark Done", "Mark habit done for today", "A habit is visible and not completed for today.", "Tap the habit completion control/check circle.", "Selected date: Today", "Habit card updates to completed state and completed count increases by 1.", "POST markHabitDone called with today's date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-017", "Mark Done", "Completed habit remains done after reload", "Habit was marked done.", "Pull refresh or navigate away and back to Home.", "Same habit/date", "Habit still appears completed and progress count remains correct.", "GET habit list returns completed=true and last_completed date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-018", "Mark Done", "Do not allow done for future date", "Home date scroller supports future date.", "Select tomorrow/future date > Tap completion control.", "Future selected date", "Warning toast appears; habit is not marked done.", "POST markHabitDone is not called.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-019", "Mark Done", "Done API failure rolls back safely", "A not-completed habit is visible.", "Trigger mark done while API/network fails.", "Network disabled or server error", "Error toast appears; habit should not remain falsely completed after reload.", "POST markHabitDone fails and UI reconciles with backend.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-020", "Mark Done", "Multiple habits done count is accurate", "At least 3 habits exist for today.", "Mark two different habits done.", "2 habits", "Progress pill shows 2/N and each completed card displays done state.", "Each habit sends one mark done request; list reload reconciles count.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-021", "Habit Detail", "Open habit details from Home card", "A habit card is visible.", "Tap habit card body/name area.", "Any habit id/date", "Habit detail screen opens with title, subtitle, details, summary, weekly overview, and monthly overview.", "GET habit detail called with id and date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-022", "Habit Detail", "Habit details match selected habit", "Habit detail screen is open.", "Compare detail title/metric/frequency/reminder with Home card.", "Same habit", "Displayed details match selected habit data.", "Detail API response maps fields correctly.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-023", "Habit History", "Weekly history displays completed days", "Habit has last 7 days completion data.", "Open habit detail > Inspect Weekly Overview.", "last_7_days_completion", "Weekly row shows correct days and completed checkmarks.", "Detail response last_7_days_completion maps to WeeklyHabitRowPanel.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-024", "Habit History", "Monthly history displays completed days", "Habit has completed_days_in_month data.", "Open habit detail > Inspect Monthly Overview.", "completed_days_in_month", "Monthly calendar/pulse marks completed days accurately.", "Detail response completed_days_in_month maps to MonthlyOverviewPanel.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-025", "Habit History", "Summary metrics display correctly", "Habit has streak/success-rate data.", "Open habit detail > Inspect Summary cards.", "current_streak, success_rate, longest_streak, total_completed_habits", "Summary shows current streak, success rate, best streak day, and completed habits.", "Detail response fields are transformed into summary_data.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-026", "Habit Detail", "Past date hides delete/options action", "Select a past date from Home.", "Open habit detail for past date.", "Yesterday or earlier", "Header options/delete action is hidden for past dates.", "showRightAction false when selected date is before today.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-027", "Habit Detail", "Today/future date shows options action", "Select today or future date.", "Open habit detail.", "Today or tomorrow", "Header ellipsis/options action is visible.", "showRightAction true for today/future.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-028", "Delete Habit", "Open delete confirmation modal", "Habit detail is open for today/future date.", "Tap header ellipsis/options.", "Any deletable habit", "Delete confirmation modal opens with habit name and warning copy.", "No delete API call until Delete is pressed.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-029", "Delete Habit", "Cancel delete keeps habit", "Delete modal is open.", "Tap Cancel or backdrop.", "Any habit", "Modal closes and habit remains in detail/list.", "DELETE API is not called.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-030", "Delete Habit", "Delete low-history habit", "Habit does not require hard DELETE confirmation.", "Open delete modal > Tap Delete.", "current_streak < 3 and longest_streak < 10", "Success toast appears, modal closes, user navigates back, habit disappears from Home list.", "DELETE habit detail endpoint called with id and selected date; 204 normalized to success.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-031", "Delete Habit", "Hard confirmation required for established habit", "Habit current streak >= 3 or longest/completed count >= 10.", "Open delete modal.", "Established habit", "DELETE input appears and Delete button is disabled until exact DELETE is entered.", "DELETE API is not called before valid confirmation.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-032", "Delete Habit", "Hard confirmation rejects wrong text", "Hard confirm modal is open.", "Type anything except DELETE.", "Example: delete or REMOVE", "Delete button remains disabled.", "No DELETE API call.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-033", "Delete Habit", "Hard confirmation deletes with exact DELETE", "Hard confirm modal is open.", "Type DELETE > Tap Delete.", "Confirm text: DELETE", "Success toast appears and habit is removed going forward; history copy indicates past check-ins remain.", "DELETE API called once with habit id/date.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-034", "Delete Habit Error", "Delete API failure shows error", "Delete modal is open.", "Tap Delete while API/network fails.", "Network disabled or server error", "Error toast appears; modal/user state remains recoverable; habit is not removed from list after reload.", "DELETE endpoint failure is surfaced.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-035", "History After Delete", "Past history remains after deletion", "Habit has previous completions and was deleted going forward.", "Navigate to a date before deletion or history view/detail if available.", "Deleted habit with prior check-ins", "Past check-in/history remains visible according to product copy.", "Backend still returns historical records where expected.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-036", "Regression", "Back navigation returns to previous screen", "User is on Create Habit or Habit Detail.", "Tap back button.", "N/A", "User returns to previous screen without losing unrelated app state.", "No unintended API mutation.", "", "Not Run", "Medium", "iOS / Android", "", ""],
    ["HAB-037", "Regression", "Loading skeleton appears for details", "Network is slow.", "Open habit detail.", "Throttle network", "Skeleton/loading state appears before content loads.", "GET detail is pending and UI remains responsive.", "", "Not Run", "Low", "iOS / Android", "", ""],
    ["HAB-038", "Regression", "Rapid done taps do not overcount", "A not-completed habit is visible.", "Tap done control repeatedly quickly.", "3-5 rapid taps", "Habit should complete once and progress count should not exceed total habits.", "At most one durable completion should be reflected after reload.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-039", "Regression", "Created habit survives app restart", "Habit created successfully.", "Close app completely > Reopen > Home tab.", "Created habit", "Created habit still appears for relevant date/frequency.", "GET list includes persisted habit.", "", "Not Run", "High", "iOS / Android", "", ""],
    ["HAB-040", "Accessibility", "Core habit actions are tappable and readable", "Home, Create, Detail, and Delete screens available.", "Inspect labels, button sizes, disabled states, and contrast.", "Small/large device sizes", "Primary actions are readable, tappable, and do not overlap with bottom navigation or modals.", "Manual visual/accessibility check.", "", "Not Run", "Medium", "iOS / Android", "", ""],
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
    return f'<c r="{ref}" t="inlineStr"{style_attr}><is><t>{html.escape(str(value))}</t></is></c>'


def row_xml(row_num: int, values, style: int = 0, height: int | None = None) -> str:
    height_attr = f' ht="{height}" customHeight="1"' if height else ""
    cells = "".join(cell_xml(row_num, col, value, style) for col, value in enumerate(values, 1))
    return f'<row r="{row_num}"{height_attr}>{cells}</row>'


def worksheet_xml(
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


def build_summary_sheet() -> str:
    rows = [
        '<row r="1" ht="30" customHeight="1">' + cell_xml(1, 1, "Habit UI Manual Test Cases", 1) + "</row>",
        row_xml(2, [f"Generated: {date.today().isoformat()}"], 2, 22),
        row_xml(4, ["Metric", "Count"], 3, 22),
        '<row r="5">' + cell_xml(5, 1, "Total Test Cases", 4) + cell_xml(5, 2, None, 4, "COUNTA('Habit UI Test Cases'!A2:A200)") + "</row>",
        '<row r="6">' + cell_xml(6, 1, "Passed", 4) + cell_xml(6, 2, None, 4, 'COUNTIF(\'Habit UI Test Cases\'!J2:J200,"Pass")') + "</row>",
        '<row r="7">' + cell_xml(7, 1, "Failed", 4) + cell_xml(7, 2, None, 4, 'COUNTIF(\'Habit UI Test Cases\'!J2:J200,"Fail")') + "</row>",
        '<row r="8">' + cell_xml(8, 1, "Blocked", 4) + cell_xml(8, 2, None, 4, 'COUNTIF(\'Habit UI Test Cases\'!J2:J200,"Blocked")') + "</row>",
        '<row r="9">' + cell_xml(9, 1, "Not Run", 4) + cell_xml(9, 2, None, 4, 'COUNTIF(\'Habit UI Test Cases\'!J2:J200,"Not Run")') + "</row>",
        row_xml(11, ["Scope", "Habit creation, validation, Home habit list, mark done, detail/history views, delete modal, hard confirmation, and core regression checks."], 5, 42),
        row_xml(12, ["How to use", "During manual QA, fill Actual Result, Status, Owner, and Remarks. Use Status dropdown values: Pass, Fail, Blocked, Not Run."], 5, 42),
    ]
    return worksheet_xml(rows, "A1:B12", cols=[(1, 34), (2, 104)], merge_cells=["A1:B1"])


def build_cases_sheet() -> str:
    rows = [row_xml(1, HEADERS, 3, 28)]
    for idx, case in enumerate(TEST_CASES, 2):
        rows.append(row_xml(idx, case, 4, 66))
    max_row = len(TEST_CASES) + 1
    return worksheet_xml(
        rows,
        f"A1:N{max_row}",
        cols=[
            (1, 13), (2, 22), (3, 36), (4, 44), (5, 58), (6, 32), (7, 58),
            (8, 42), (9, 30), (10, 14), (11, 12), (12, 16), (13, 18), (14, 30)
        ],
        freeze_pane=True,
        auto_filter=f"A1:N{max_row}",
        data_validations=[
            ('J2:J200', '"Pass,Fail,Blocked,Not Run"'),
            ('K2:K200', '"High,Medium,Low"'),
        ],
    )


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
    <sheet name="Habit UI Test Cases" sheetId="2" r:id="rId2"/>
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
  <dc:title>Habit UI Manual Test Cases</dc:title>
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
  <TitlesOfParts><vt:vector size="2" baseType="lpstr"><vt:lpstr>Summary</vt:lpstr><vt:lpstr>Habit UI Test Cases</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>''',
    }
    with zipfile.ZipFile(OUTPUT_FILE, "w", zipfile.ZIP_DEFLATED) as zf:
        for arcname, content in files.items():
            zf.writestr(arcname, content)


if __name__ == "__main__":
    write_xlsx()
    print(OUTPUT_FILE)
