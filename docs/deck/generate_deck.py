"""RicozInvoice 12-page business deck (SMB customers) -> PDF.

Regenerable:  python docs/deck/generate_deck.py
Output:       docs/RicozInvoice-Business-Deck.pdf  (A4 landscape)
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

OUT = "docs/RicozInvoice-Business-Deck.pdf"


def footer(c, n):
    c.setFont("Helvetica", 8)
    c.setFillColor(FAINT)
    c.drawString(M, 26, "RicozInvoice  -  Billing, without the chaos")
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
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # red R mark
    c.setFillColor(BRAND)
    c.roundRect(M, H - 130, 56, 56, 12, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 34)
    c.drawCentredString(M + 28, H - 130 + 12, "R")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(M + 68, H - 102, "RicozInvoice")
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED)
    c.drawString(M + 68, H - 122, "Billing, without the chaos")
    c.setFont("Helvetica-Bold", 52)
    c.setFillColor(INK)
    c.drawString(M, H - 230, "Every rupee,")
    c.drawString(M, H - 288, "in focus.")
    c.setFont("Helvetica", 14)
    c.setFillColor(MUTED)
    c.drawString(M, H - 322, "Estimates, invoices, recurring billing, expenses, projects, time and reports -")
    c.drawString(M, H - 344, "one calm workspace for your business.")
    for i, t in enumerate(["Invoices", "Estimates", "Expenses", "Reports"]):
        pill(c, M + i * 150, H - 400, 136, 30, t)
    c.setFillColor(BRAND)
    c.roundRect(M, 96, 250, 48, 10, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(M + 125, 112, "Create your workspace  >")
    c.setFont("Helvetica", 10)
    c.setFillColor(FAINT)
    c.drawString(M, 66, "Customer business deck  -  12 pages")
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
    c.drawString(M, 118, "Contact: hello@ricozinvoice.example   |   Demo: /dashboard")
    c.drawString(M, 100, "RicozInvoice  -  Billing, without the chaos")
    c.setFont("Helvetica", 8)
    c.drawRightString(W - M, 26, "12 / 12")


def build():
    import os
    os.makedirs("docs", exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=landscape(A4))
    c.setTitle("RicozInvoice - Business Deck (Customers)")
    c.setAuthor("RicozInvoice")
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
