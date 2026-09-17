"""RicozServe 12-page business deck (SMB customers) -> PDF.

Regenerable:  python docs/deck/generate_deck.py
Output:       docs/RicozServe-Business-Deck.pdf  (A4 landscape)
Brand:        #C4122F red, #111827 ink, Inter-like system sans (Helvetica).
Figures labelled 'demo illustration' come from the verified Atlas test run.
Pricing comes from server/src/config/plans.js (TRIAL_DAYS + PLANS).
"""
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

W, H = landscape(A4)  # 841.89 x 595.28
M = 48

BRAND = HexColor("#C4122F")
BRAND_D = HexColor("#A50E27")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")
FAINT = HexColor("#9AA3B0")
LINE = HexColor("#ECECF0")
BG = HexColor("#F7F8FA")
PINK = HexColor("#FFF1F2")
GREEN = HexColor("#16A34A")
AMBER = HexColor("#F59E0B")
DARK = HexColor("#111827")
WHITE = HexColor("#FFFFFF")
SLATE = HexColor("#7E93A7")
SLATE_D = HexColor("#6B8298")
SLATE_L = HexColor("#E8EDF1")
CHROME = HexColor("#F1F2F4")

OUT = "docs/RicozServe-Business-Deck.pdf"


def footer(c, n):
    c.setFont("Helvetica", 8)
    c.setFillColor(FAINT)
    c.drawString(M, 26, "RicozServe  -  Billing, without the chaos")
    c.drawRightString(W - M, 26, f"{n} / 12")


def header(c, eyebrow, title, sub=None):
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(BRAND)
    c.drawString(M, H - 52, eyebrow.upper())
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(INK)
    c.drawString(M, H - 92, title)
    if sub:
        c.setFont("Helvetica", 12.5)
        c.setFillColor(MUTED)
        c.drawString(M, H - 114, sub)
    return H - 140


def card(c, x, y, w, h, accent=BRAND, fill=WHITE):
    """Rounded card with top accent bar. (x,y) = bottom-left."""
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 10, fill=1, stroke=1)
    c.setFillColor(accent)
    # top accent strip clipped to rounded top: thin rect + cover seam
    c.roundRect(x + 1, y + h - 6, w - 2, 5, 2, fill=1, stroke=0)
    c.setFillColor(fill)
    c.rect(x + 1, y + h - 8, w - 2, 4, fill=1, stroke=0)


def card_title(c, x, y, label, value, sub=None):
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(MUTED)
    c.drawString(x, y, label.upper())
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(INK)
    c.drawString(x, y - 30, value)
    if sub:
        c.setFont("Helvetica", 10)
        c.setFillColor(MUTED)
        c.drawString(x, y - 46, sub)


def bullets(c, items, x, y, gap=22, size=12, bullet="--", bcolor=BRAND):
    c.setFont("Helvetica", size)
    for it in items:
        c.setFillColor(bcolor)
        c.setFont("Helvetica-Bold", size)
        c.drawString(x, y, bullet)
        c.setFillColor(INK)
        c.setFont("Helvetica", size)
        c.drawString(x + 22, y, it)
        y -= gap
    return y


def pill(c, x, y, w, h, text, fill=PINK, fg=BRAND, size=10):
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, h / 2, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", size)
    c.setFillColor(fg)
    c.drawCentredString(x + w / 2, y + h / 2 - size / 2 + 1, text)


# ---------------- pages ----------------

def p1_cover(c):
    """GoDecor-style hero but in project UI colors: #F7F8FA + #EEF0F4 grid, brand #C4122F."""
    # --- project UI background (light, matches client invoice-grid) ---
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # grid lines like .invoice-grid (#EEF0F4, 44px -> ~32pt)
    c.setStrokeColor(HexColor("#EEF0F4"))
    c.setLineWidth(0.7)
    step = 32
    x = 0
    while x <= W:
        c.line(x, 0, x, H)
        x += step
    y = 0
    while y <= H:
        c.line(0, y, W, y)
        y += step

    # --- top bar: brand left, deck label right ---
    c.setFillColor(BRAND)
    c.roundRect(M, H - 84, 40, 40, 9, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(M + 20, H - 84 + 8, "R")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(M + 50, H - 68, "RicozServe")
    c.setFont("Helvetica", 10.5)
    c.setFillColor(MUTED)
    c.drawString(M + 50, H - 82, "Billing, without the chaos")
    c.setFont("Helvetica", 8.5)
    c.setFillColor(FAINT)
    c.drawRightString(W - M, H - 66, "Customer business deck  -  12 pages")

    # --- headline (centered, ink on light) ---
    c.setFillColor(BRAND)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(W / 2, H - 122, "WORKSPACE  /  OVERVIEW")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 38)
    c.drawCentredString(W / 2, H - 158, "Every rupee, in focus.")
    c.setFont("Helvetica", 11.5)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, H - 180,
                        "Estimates, invoices, recurring billing, expenses, projects, time and reports - one calm workspace.")

    # --- pill marquee (project UI pills: pink + white, like WorkspaceTopbar) ---
    row1 = ["Total Billed", "Collected", "Outstanding", "Expenses", "Invoices", "Estimates"]
    row2 = ["Recurring", "Customers", "Projects", "Time tracking", "Reports", "GST-Ready"]
    for r, items in enumerate((row1, row2)):
        pw, ph, gap = 108, 21, 8
        total = len(items) * pw + (len(items) - 1) * gap
        x = (W - total) / 2
        y = H - 214 - r * 28
        for t in items:
            # row1 = pink pill (bg #FFF1F2, text #C4122F) like active Workspace pill
            # row2 = white pill with line border, ink text
            if r == 0:
                fill, fg, stroke = PINK, BRAND, HexColor("#F3C2C8")
            else:
                fill, fg, stroke = WHITE, INK, LINE
            c.setFillColor(fill)
            c.setStrokeColor(stroke)
            c.setLineWidth(0.8)
            c.roundRect(x, y, pw, ph, ph / 2, fill=1, stroke=1)
            c.setFont("Helvetica-Bold", 7.5)
            c.setFillColor(fg)
            c.drawCentredString(x + pw / 2, y + 6.5, t)
            x += pw + gap

    # --- browser mockup (live dashboard UI, seeded demo data) ---
    BW, BH = 600, 290
    bx = (W - BW) / 2
    by = 52
    # soft shadow matching light UI
    c.setFillColor(HexColor("#E2E5EB"))
    c.roundRect(bx + 4, by - 4, BW, BH, 12, fill=1, stroke=0)
    # window body
    c.setFillColor(WHITE)
    c.setStrokeColor(HexColor("#D9E0E8"))
    c.setLineWidth(1)
    c.roundRect(bx, by, BW, BH, 12, fill=1, stroke=1)
    # chrome bar
    c.setFillColor(CHROME)
    c.roundRect(bx + 1, by + BH - 33, BW - 2, 32, 8, fill=1, stroke=0)
    c.setFillColor(CHROME)
    c.rect(bx + 1, by + BH - 33, BW - 2, 20, fill=1, stroke=0)
    for i, col in enumerate((HexColor("#FF5F57"), HexColor("#FEBC2E"), HexColor("#28C840"))):
        c.setFillColor(col)
        c.circle(bx + 20 + i * 16, by + BH - 16, 5, fill=1, stroke=0)
    # url pill
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(bx + 70, by + BH - 27, 300, 21, 10, fill=1, stroke=1)
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawCentredString(bx + 220, by + BH - 19, "ricozserve.app/dashboard")
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(GREEN)
    c.drawRightString(bx + BW - 16, by + BH - 19, "Live UI")

    # inside: sidebar + main
    ux, uy = bx + 12, by + 12          # inner origin
    uw, uh = BW - 24, BH - 58          # inner size
    sbw = 118                          # sidebar width
    # sidebar
    c.setFillColor(BG)
    c.roundRect(ux, uy, sbw, uh, 8, fill=1, stroke=0)
    c.setFillColor(BRAND)
    c.roundRect(ux + 10, uy + uh - 28, 22, 22, 5, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(ux + 21, uy + uh - 22, "R")
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(INK)
    c.drawString(ux + 38, uy + uh - 16, "Ricoz Demo")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(MUTED)
    c.drawString(ux + 38, uy + uh - 25, "Workspace")
    nav = ["Overview", "Invoices", "Estimates", "Recurring", "Customers", "Items", "Expenses"]
    ny = uy + uh - 52
    for j, n in enumerate(nav):
        if j == 0:
            c.setFillColor(WHITE)
            c.setStrokeColor(LINE)
            c.roundRect(ux + 8, ny - 4, sbw - 16, 18, 6, fill=1, stroke=1)
            c.setFont("Helvetica-Bold", 7)
            c.setFillColor(INK)
        else:
            c.setFont("Helvetica", 7)
            c.setFillColor(MUTED)
        c.drawString(ux + 18, ny, n)
        ny -= 20
    # main panel
    mx = ux + sbw + 10
    mw = uw - sbw - 10
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(INK)
    c.drawString(mx, uy + uh - 16, "Financial overview")
    c.setFont("Helvetica", 7)
    c.setFillColor(MUTED)
    c.drawString(mx, uy + uh - 27, "Track what is billed, collected, spent, and still outstanding.")
    # This-month pill
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(mx + mw - 78, uy + uh - 30, 78, 18, 9, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(INK)
    c.drawCentredString(mx + mw - 39, uy + uh - 23, "This month")
    # 4 KPI mini cards (seeded demo data)
    kpis = [("TOTAL BILLED", "Rs.17,700", "1 inv", DARK),
            ("COLLECTED", "Rs.5,000", "UPI paid", GREEN),
            ("OUTSTANDING", "Rs.12,700", "open", BRAND),
            ("EXPENSES", "Rs.850", "billable", AMBER)]
    kw = (mw - 18) / 4
    kx = mx
    ky = uy + uh - 96
    for label, val, sub, accent in kpis:
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.roundRect(kx, ky, kw, 58, 7, fill=1, stroke=1)
        c.setFillColor(accent)
        c.roundRect(kx + 1, ky + 53, kw - 2, 4, 2, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 5.5)
        c.setFillColor(MUTED)
        c.drawString(kx + 7, ky + 42, label)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(INK)
        c.drawString(kx + 7, ky + 26, val)
        c.setFont("Helvetica", 6.5)
        c.setFillColor(MUTED)
        c.drawString(kx + 7, ky + 14, sub)
        kx += kw + 6
    # bottom row: cash-flow bars + quick actions
    # cash flow box
    cwf_y = uy + 12
    cwf_h = ky - cwf_y - 8
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(mx, cwf_y, mw * 0.60, cwf_h, 7, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(INK)
    c.drawString(mx + 8, cwf_y + cwf_h - 16, "Cash flow")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(MUTED)
    c.drawString(mx + 8, cwf_y + cwf_h - 26, "Billed vs collected (demo)")
    bars = [18, 30, 26, 44, 58, 72]
    bxx = mx + 12
    for v in bars:
        h = v * 0.75
        c.setFillColor(DARK)
        c.roundRect(bxx, cwf_y + 18, 10, h, 2, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.roundRect(bxx + 12, cwf_y + 18, 10, h * 0.65, 2, fill=1, stroke=0)
        bxx += 34
    # quick actions box
    qax = mx + mw * 0.60 + 8
    qaw = mw * 0.40 - 8
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(qax, cwf_y, qaw, cwf_h, 7, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(INK)
    c.drawString(qax + 8, cwf_y + cwf_h - 16, "Quick actions")
    qa = ["New invoice", "New estimate", "Add customer"]
    qy = cwf_y + cwf_h - 46
    for q in qa:
        c.setFillColor(BG)
        c.roundRect(qax + 7, qy, qaw - 14, 20, 5, fill=1, stroke=0)
        c.setFillColor(BRAND)
        c.circle(qax + 17, qy + 10, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(qax + 17, qy + 8, "+")
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(INK)
        c.drawString(qax + 27, qy + 7.5, q)
        qy -= 26

    # caption under mockup
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, by - 16, "Live product UI  -  Financial Overview (demo data: Rs.17,700 billed)")
    # footer (standard deck footer on light bg)
    footer(c, 1)


def p2_problem(c):
    y = header(c, "The problem", "Billing chaos costs small businesses money.",
               "Four leaks we hear from owners every week.")
    pains = [
        ("Scattered paperwork", "Estimates in email, invoices in...", "spreadsheets, nothing linked.", BRAND),
        ("Late follow-ups", "No view of what is awaiting,", "overdue, or ready to convert.", AMBER),
        ("Invisible receivables", "Nobody knows the outstanding", "balance by age - cash surprises.", BRAND),
        ("Leaking billables", "Expenses and billable hours", "never make it onto invoices.", GREEN),
    ]
    cw, gap = 168, 16
    x = M
    for title, l1, l2, accent in pains:
        card(c, x, y - 150, cw, 150, accent)
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(INK)
        c.drawString(x + 16, y - 44, title)
        c.setFont("Helvetica", 11)
        c.setFillColor(MUTED)
        c.drawString(x + 16, y - 66, l1)
        c.drawString(x + 16, y - 84, l2)
        x += cw + gap
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(INK)
    c.drawString(M, y - 200, "Result: delayed collections, write-offs, and tax-time panic.")
    footer(c, 2)


def p3_solution(c):
    y = header(c, "The solution", "One workspace for the whole money trail.",
               "15 modules, one login, zero re-typing.")
    mods = ["Overview", "Invoices", "Estimates", "Recurring", "Customers", "Items",
            "Expenses", "Projects", "Time tracking", "Credit notes", "Debit notes",
            "Reports", "Notifications", "Team", "Settings"]
    bullets(c, [
        "Estimate to invoice in one click - scope never gets re-typed.",
        "Every payment, expense and hour rolls into live reports.",
        "INR-first with paise-accurate totals and GST-ready taxes.",
    ], M, y, gap=26)
    # module pills grid (right side)
    px = M + 330
    for i, m in enumerate(mods):
        r, col = divmod(i, 3)
        pill(c, px + col * 150, y - 40 - r * 38, 140, 28, m,
             fill=WHITE, fg=INK, size=10)
    footer(c, 3)


def p4_journey(c):
    y = header(c, "How it works", "From first customer to collected cash in 6 steps.",
               "The exact demo path - every step is one click from the last.")
    steps = [("01", "Add customer", "/customers"),
             ("02", "Add item", "/items"),
             ("03", "Estimate", "/estimates"),
             ("04", "Convert", "1 click"),
             ("05", "Invoice + pay", "/invoices/:id"),
             ("06", "Reports", "/reports")]
    sw = 108
    x = M
    for num, title, route in steps:
        card(c, x, y - 170, sw, 170, BRAND)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(BRAND)
        c.drawString(x + 14, y - 40, num)
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(INK)
        c.drawString(x + 14, y - 62, title)
        c.setFont("Helvetica", 9.5)
        c.setFillColor(MUTED)
        c.drawString(x + 14, y - 80, route)
        if title != "Reports":
            c.setFont("Helvetica-Bold", 18)
            c.setFillColor(BRAND)
            c.drawString(x + sw + 4, y - 95, ">")
        x += sw + 26
    c.setFont("Helvetica", 11)
    c.setFillColor(MUTED)
    c.drawString(M, y - 215, "Quick actions and the red + Create menu keep the next step one tap away, everywhere.")
    footer(c, 4)


def p5_sell(c):
    y = header(c, "Sell faster", "Propose, get a yes, and bill - without rework.")
    cards = [
        ("Estimates", "Send sharp proposals with", "validity dates and GST lines.", BRAND),
        ("1-click convert", "Accepted? Convert EST to INV", "instantly - lines carry over.", GREEN),
        ("Recurring billing", "Weekly to yearly schedules,", "Net terms, auto next-run.", AMBER),
    ]
    x = M
    for t, l1, l2, accent in cards:
        card(c, x, y - 150, 228, 150, accent)
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(INK)
        c.drawString(x + 16, y - 44, t)
        c.setFont("Helvetica", 11)
        c.setFillColor(MUTED)
        c.drawString(x + 16, y - 68, l1)
        c.drawString(x + 16, y - 86, l2)
        x += 244
    c.setFont("Helvetica", 10.5)
    c.setFillColor(FAINT)
    c.drawString(M, y - 195, "Demo illustration (verified run): EST-0001  Rs.17,700  -->  INV-0001, same lines, same totals.")
    footer(c, 5)


def p6_paid(c):
    y = header(c, "Get paid", "Collect every rupee - including partial payments.")
    left = [
        "UPI, Card, Netbanking and Cash at collection.",
        "Part-payments tracked: paid vs balance always visible.",
        "Overdue and open invoices feed the dashboard automatically.",
    ]
    bullets(c, left, M, y, gap=26)
    # example payment card
    card(c, M + 360, y - 190, 340, 190, GREEN)
    bx = M + 380
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(INK)
    c.drawString(bx, y - 44, "INV-0001  -  demo illustration")
    rows = [("Total", "Rs.17,700", INK), ("Paid (UPI)", "Rs.5,000", GREEN), ("Balance", "Rs.12,700", BRAND)]
    yy = y - 76
    for label, val, col in rows:
        c.setFont("Helvetica", 11.5)
        c.setFillColor(MUTED)
        c.drawString(bx, yy, label)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(col)
        c.drawRightString(bx + 300, yy, val)
        yy -= 28
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(WHITE)
    c.setFillColor(GREEN)
    c.roundRect(bx, yy - 22, 120, 28, 8, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.drawCentredString(bx + 60, yy - 14, "partial")
    footer(c, 6)


def p7_costs(c):
    y = header(c, "Control costs", "Billable spend and hours stop leaking.")
    cards = [
        ("Expenses", "Rs.850 billable", "Software, tagged to customer", BRAND),
        ("Projects", "Budgets in minor units", "Fixed / Hourly / Retainer", AMBER),
        ("Time tracking", "Timer + manual entries", "Billable hours to amount", GREEN),
    ]
    x = M
    for t, l1, l2, accent in cards:
        card(c, x, y - 150, 228, 150, accent)
        card_title(c, x + 16, y - 30, t, l1, l2)
        x += 244
    c.setFont("Helvetica", 11)
    c.setFillColor(MUTED)
    c.drawString(M, y - 195, "Billable expenses and hours sit ready to be added to the next invoice - nothing forgotten.")
    footer(c, 7)


def p8_compliance(c):
    y = header(c, "Stay clear & compliant", "Adjustments and answers, all in one hub.")
    bullets(c, [
        "Credit & debit notes linked to source invoices with reason + tax.",
        "Reports hub: 8 tabs with date-range and customer filters.",
        "Receivables aging by 0-30 / 31-60 / 61-90 / 90+ days.",
    ], M, y, gap=26)
    tabs = ["Overview", "Revenue", "Sales", "Invoices", "Payments", "Expenses", "Receivables", "Tax"]
    tx = M + 360
    for i, t in enumerate(tabs):
        r, col = divmod(i, 4)
        pill(c, tx + col * 96, y - 40 - r * 38, 88, 28, t, fill=WHITE, fg=INK, size=9)
    footer(c, 8)


def p9_glance(c):
    y = header(c, "Money at a glance", "The Financial Overview owners open every morning.")
    stats = [("Total billed", "Rs.17,700", DARK), ("Collected", "Rs.5,000", GREEN),
             ("Outstanding", "Rs.12,700", BRAND), ("Expenses", "Rs.850", AMBER)]
    x = M
    for label, val, accent in stats:
        card(c, x, y - 120, 172, 120, accent)
        card_title(c, x + 14, y - 28, label, val)
        x += 186
    # cash-flow mini bars
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(INK)
    c.drawString(M, y - 170, "Cash flow (demo illustration)")
    months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    vals = [20, 35, 30, 55, 70, 95]
    bx = M
    for m, v in zip(months, vals):
        h = v * 1.1
        c.setFillColor(DARK)
        c.roundRect(bx, y - 300, 26, h, 3, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.roundRect(bx + 30, y - 300, 26, h * 0.7, 3, fill=1, stroke=0)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawCentredString(bx + 28, y - 314, m)
        bx += 110
    c.setFont("Helvetica", 10)
    c.setFillColor(FAINT)
    c.drawString(M, y - 340, "Dark = billed   Green = collected   + quick actions: New invoice / estimate / customer / expense.")
    footer(c, 9)


def p10_trust(c):
    y = header(c, "Trust & teamwork", "Your books stay yours - and your team stays in sync.")
    cards = [
        ("Workspace isolation", "JWT sessions scoped per", "organisation. Your data only.", BRAND),
        ("Roles & team", "Admins and agents with", "clear workspace roles.", AMBER),
        ("Activity feed", "Invoice created, payments,", "schedules - all notified.", GREEN),
        ("Settings control", "Business + GST profile,", "numbering, taxes, modes.", DARK),
    ]
    x = M
    for t, l1, l2, accent in cards:
        card(c, x, y - 150, 172, 150, accent)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(INK)
        c.drawString(x + 14, y - 44, t)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(MUTED)
        c.drawString(x + 14, y - 66, l1)
        c.drawString(x + 14, y - 84, l2)
        x += 186
    c.setFont("Helvetica", 11)
    c.setFillColor(MUTED)
    c.drawString(M, y - 195, "Offline-tolerant UI with honest empty states - the app never shows a blank screen.")
    footer(c, 10)


def p11_pricing(c):
    y = header(c, "Plans & start", "Start free. Grow when collections grow.",
               "Pricing mirrors the in-app plan catalogue - 14-day Pro trial included.")
    plans = [
        ("Starter", "Rs.0", "2 seats", "Core invoicing", DARK),
        ("Pro  *", "Rs.499/mo", "25 seats", "Reports + API", BRAND),
        ("Scale", "Rs.999/mo", "Unlimited seats", "Everything + AI", AMBER),
    ]
    x = M
    for name, price, seats, feat, accent in plans:
        card(c, x, y - 170, 228, 170, accent)
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(INK)
        c.drawString(x + 16, y - 44, name)
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(accent if accent is not DARK else INK)
        c.drawString(x + 16, y - 74, price)
        c.setFont("Helvetica", 11)
        c.setFillColor(MUTED)
        c.drawString(x + 16, y - 96, seats)
        c.drawString(x + 16, y - 114, feat)
        x += 244
    c.setFont("Helvetica", 10.5)
    c.setFillColor(MUTED)
    c.drawString(M, y - 205, "* Most popular. Annual billing saves ~20% (Rs.4,790 Pro / Rs.9,590 Scale).")
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(INK)
    c.drawString(M, y - 235, "Start in minutes:  1. Sign up  >  2. Add customer  >  3. Send first invoice")
    footer(c, 11)


def p12_cta(c):
    c.setFillColor(BRAND)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.roundRect(M, H - 130, 56, 56, 12, fill=1, stroke=0)
    c.setFillColor(BRAND)
    c.setFont("Helvetica-Bold", 34)
    c.drawCentredString(M + 28, H - 130 + 12, "R")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 40)
    c.drawString(M, H - 240, "Send your first")
    c.drawString(M, H - 290, "invoice today.")
    c.setFont("Helvetica", 14)
    c.drawString(M, H - 324, "Your workspace is ready - customers, items and reports included.")
    c.setFillColor(WHITE)
    c.roundRect(M, 150, 280, 52, 10, fill=1, stroke=0)
    c.setFillColor(BRAND)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(M + 140, 168, "Create your workspace  >")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 11)
    c.drawString(M, 118, "Contact: hello@ricozserve.example   |   Demo: /dashboard")
    c.drawString(M, 100, "RicozServe  -  Billing, without the chaos")
    c.setFont("Helvetica", 8)
    c.drawRightString(W - M, 26, "12 / 12")


def build():
    import os
    os.makedirs("docs", exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=landscape(A4))
    c.setTitle("RicozServe - Business Deck (Customers)")
    c.setAuthor("RicozServe")
    for fn in (p1_cover, p2_problem, p3_solution, p4_journey, p5_sell, p6_paid,
               p7_costs, p8_compliance, p9_glance, p10_trust, p11_pricing, p12_cta):
        c.setFillColor(BG)
        if fn is not p1_cover and fn is not p12_cta:
            c.rect(0, 0, W, H, fill=1, stroke=0)
        fn(c)
        c.showPage()
    c.save()
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
