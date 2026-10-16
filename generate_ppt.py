import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color definitions
    COLOR_PRIMARY = RGBColor(10, 102, 194)       # LinkedIn / ProjectBuddy Blue
    COLOR_NAVY = RGBColor(15, 39, 68)           # Dark Header Navy
    COLOR_DARK = RGBColor(25, 25, 25)           # Body Text
    COLOR_MUTED = RGBColor(102, 102, 102)       # Subtitle Gray
    COLOR_WHITE = RGBColor(255, 255, 255)       # Pure White
    COLOR_ACCENT = RGBColor(5, 118, 66)         # Secondary Green
    COLOR_CARD_BG = RGBColor(245, 247, 250)     # Clean Card Gray
    COLOR_CARD_BORDER = RGBColor(218, 224, 233) # Subtle Border
    COLOR_HIGHLIGHT = RGBColor(230, 81, 0)      # Warm Accent

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_BG, border_color=COLOR_CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        return shape

    def add_header(slide, title_text, category_text="PROJECTBUDDY PLATFORM"):
        # Category tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_PRIMARY

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_NAVY

    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 1: Title Slide (Cover)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, COLOR_NAVY)

    # Accent decorative top bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
    bar.fill.solid()
    bar.fill.fore_color.rgb = COLOR_PRIMARY
    bar.line.fill.background()

    # Title Container
    box1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(4.5))
    tf1 = box1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "🚀 ACADEMIC COLLABORATION PLATFORM"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(100, 181, 246)
    p0.space_after = Pt(14)

    p1 = tf1.add_paragraph()
    p1.text = "ProjectBuddy"
    p1.font.size = Pt(48)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.space_after = Pt(14)

    p2 = tf1.add_paragraph()
    p2.text = "The LinkedIn for University Students with Anti-Theft Idea Vault & Anonymous Administration"
    p2.font.size = Pt(20)
    p2.font.color.rgb = RGBColor(220, 230, 242)
    p2.space_after = Pt(28)

    p3 = tf1.add_paragraph()
    p3.text = "• Zero Idea Theft Guarantee   |   • Skill-Match Compatibility Engine   |   • Anonymous Admin Audit"
    p3.font.size = Pt(13)
    p3.font.color.rgb = RGBColor(160, 185, 215)

    # ==========================================
    # SLIDE 2: Problem Statement
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, COLOR_WHITE)
    add_header(s2, "The Problem: Why Student Ideas Die in Isolation")

    # 3 Column Cards
    card_w = Inches(3.64)
    card_h = Inches(4.8)
    y_pos = Inches(1.8)

    # Card 1: Fear of Idea Theft
    add_card(s2, Inches(0.8), y_pos, card_w, card_h)
    box = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(3.24), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🔒 Fear of Idea Theft"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_HIGHLIGHT
    p.space_after = Pt(14)

    bullets1 = [
        "Students hesitate to post innovative project concepts on public forums.",
        "Sharing full blueprints or architecture leads to premature copying by peers.",
        "Result: Students work alone, miss hackathon deadlines, or abandon ambitious ideas."
    ]
    for b in bullets1:
        p = tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(10)

    # Card 2: Skill-Set Mismatch
    add_card(s2, Inches(4.84), y_pos, card_w, card_h)
    box = s2.shapes.add_textbox(Inches(5.04), Inches(2.0), Inches(3.24), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🧩 Disconnected Skills"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(14)

    bullets2 = [
        "Interdisciplinary projects need varied skill sets: AI + IoT + Design + Backend.",
        "Students only know immediate classmates within their own branch/section.",
        "No structured mechanism to evaluate technical compatibility before committing."
    ]
    for b in bullets2:
        p = tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(10)

    # Card 3: Lack of Safe Governance
    add_card(s2, Inches(8.88), y_pos, card_w, card_h)
    box = s2.shapes.add_textbox(Inches(9.08), Inches(2.0), Inches(3.24), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚖️ Surveillance & Bias"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY
    p.space_after = Pt(14)

    bullets3 = [
        "Traditional campus platforms allow staff surveillance of student concepts.",
        "Fear of institutional bias or grading prejudice inhibits creative risks.",
        "Platforms lack privacy-preserving administrative oversight and spam controls."
    ]
    for b in bullets3:
        p = tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(10)

    # ==========================================
    # SLIDE 3: The Solution
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, COLOR_WHITE)
    add_header(s3, "The Solution: Secure, Verified Student Collaboration")

    # Left Box: Key Value Pillars
    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), bg_color=RGBColor(240, 247, 255), border_color=RGBColor(187, 222, 251))
    box = s3.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🎯 What Makes ProjectBuddy Unique"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(16)

    pillars = [
        ("Anti-Theft Idea Vault", "Only project title, domain, and required skills are public. Detailed blueprints remain 100% encrypted."),
        ("Mutual Lock & Key", "Full architecture is revealed ONLY when creator reviews and formally accepts a partnership proposal."),
        ("Skill Compatibility Engine", "Automated compatibility percentage scoring (e.g. 92% Match) based on tech stack synergy."),
        ("Anonymous Admin Audit", "Institutional administrators monitor platform safety with zero access to student personal PII or private blueprints.")
    ]
    for title, desc in pillars:
        p = tf.add_paragraph()
        p.text = f"✔ {title}: "
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_NAVY
        p2 = tf.add_paragraph()
        p2.text = f"    {desc}"
        p2.font.size = Pt(12)
        p2.font.color.rgb = COLOR_MUTED
        p2.space_after = Pt(8)

    # Right Box: Expected Impact
    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8))
    box = s3.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "📈 Expected Academic Impact"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(16)

    impacts = [
        ("10x Higher Idea Sharing Rate", "Students feel 100% protected posting ambitious final-year projects and hackathon concepts."),
        ("Cross-Disciplinary Teams", "Seamless pairing between CS, Electronics, Data Science, and Design students."),
        ("Zero Intellectual Property Theft", "Cryptographically guarded descriptions ensure ownership credit remains with creator."),
        ("Faster Team Formation", "Instant matchmaking reduces partner-search friction from weeks to hours.")
    ]
    for title, desc in impacts:
        p = tf.add_paragraph()
        p.text = f"★ {title}"
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_NAVY
        p2 = tf.add_paragraph()
        p2.text = f"    {desc}"
        p2.font.size = Pt(12)
        p2.font.color.rgb = COLOR_MUTED
        p2.space_after = Pt(8)

    # ==========================================
    # SLIDE 4: Core Feature: Anti-Theft Idea Vault
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, COLOR_WHITE)
    add_header(s4, "Feature Deep Dive: Anti-Theft Idea Vault Mechanism")

    # Side-by-side comparison
    card_w = Inches(5.6)
    card_h = Inches(4.8)

    # Left: Public Discovery View
    add_card(s4, Inches(0.8), Inches(1.8), card_w, card_h)
    box = s4.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "👁️ 1. Public Discovery State (Browsing)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY
    p.space_after = Pt(12)

    public_items = [
        "Visible: Project Title (e.g. 'Autonomous Delivery Rover')",
        "Visible: Department & Academic Domain",
        "Visible: Difficulty Level (Beginner / Intermediate / Advanced)",
        "Visible: Required Tech Stack (Python, ROS, OpenCV)",
        "Visible: Skill Compatibility Match Percentage",
        "ENCRYPTED: Full Idea Blueprint & Implementation Strategy",
        "ENCRYPTED: System Architecture & Proprietary Formulas"
    ]
    for item in public_items:
        p = tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_DARK if "Visible" in item else COLOR_HIGHLIGHT
        p.font.bold = "ENCRYPTED" in item
        p.space_after = Pt(6)

    # Right: Unlocked Partner State
    add_card(s4, Inches(6.8), Inches(1.8), card_w, card_h, bg_color=RGBColor(241, 248, 233), border_color=RGBColor(200, 230, 201))
    box = s4.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🔓 2. Unlocked Partnership State (Approved)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(12)

    partner_items = [
        "Triggered ONLY after Creator accepts Partnership Proposal.",
        "Full Project Idea & Methodology revealed to verified teammate.",
        "Mutual Non-Disclosure & Collaboration Commitment activated.",
        "Direct access to Partner Collaboration Room & Milestone Tracker.",
        "Real-Time Partner Messaging Stream opened.",
        "Both partners gain joint credit on the academic portfolio."
    ]
    for item in partner_items:
        p = tf.add_paragraph()
        p.text = f"✔ {item}"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 5: Core Feature: Anonymous Admin Audit
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, COLOR_WHITE)
    add_header(s5, "Feature Deep Dive: Anonymous Administrative Monitoring")

    # Notice Box on Top
    add_card(s5, Inches(0.8), Inches(1.8), Inches(11.733), Inches(1.1), bg_color=RGBColor(237, 231, 246), border_color=RGBColor(209, 196, 233))
    box = s5.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.3), Inches(0.9))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🛡️ Zero-Knowledge Administrative Monitoring Protocol"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = RGBColor(81, 45, 168)
    p = tf.add_paragraph()
    p.text = "To eliminate surveillance bias, the admin interface displays ONLY pseudonymized telemetry tokens (e.g. STU_#849201). Legal full names, private emails, and unreleased draft ideas are strictly scrubbed."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    # 3 Governance Pillars
    col_w = Inches(3.64)
    y_p = Inches(3.2)
    h_p = Inches(3.5)

    add_card(s5, Inches(0.8), y_p, col_w, h_p)
    box = s5.shapes.add_textbox(Inches(1.0), Inches(3.4), Inches(3.24), Inches(3.1))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "1. Anonymous Telemetry"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "Monitors student activity by Department and Year.",
        "Tracks total hosted projects & formed partnerships.",
        "Allows freezing bad actors without discovering personal identities."
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    add_card(s5, Inches(4.84), y_p, col_w, h_p)
    box = s5.shapes.add_textbox(Inches(5.04), Inches(3.4), Inches(3.24), Inches(3.1))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "2. Sitewide Broadcasts"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "Admins can push real-time banner announcements to all student feeds.",
        "Ideal for campus hackathons, deadlines, and policy alerts.",
        "Instantly syncs across active student browser sessions."
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    add_card(s5, Inches(8.88), y_p, col_w, h_p)
    box = s5.shapes.add_textbox(Inches(9.08), Inches(3.4), Inches(3.24), Inches(3.1))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "3. Moderation Desk"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "Audits published project titles for community guideline compliance.",
        "1-click removal of commercial spam or inappropriate language.",
        "Private idea content remains shielded even during title moderation."
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    # ==========================================
    # SLIDE 6: Core Feature: Interactive Workspace
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, COLOR_WHITE)
    add_header(s6, "Feature Deep Dive: Partner Collaboration Room")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    box = s6.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "📋 Unlocked Blueprint & Milestones"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY
    p.space_after = Pt(12)

    collab_features = [
        "Verified Mutual Partnership Seal ensures collaborative commitment.",
        "Full project specification rendered with copy & export capabilities.",
        "Interactive 4-Stage Milestone Roadmap:",
        "    Stage 1: Problem Definition & Research Baseline",
        "    Stage 2: System Architecture & Component Design",
        "    Stage 3: Functional Prototype Implementation",
        "    Stage 4: Testing, Documentation & Showcase Demo",
        "Progress tracking badge updates automatically (0/4 -> 4/4 Complete)."
    ]
    for cf in collab_features:
        p = tf.add_paragraph()
        p.text = f"• {cf}"
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(4)

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), bg_color=RGBColor(248, 250, 252))
    box = s6.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "💬 Live Direct Messaging Stream"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(12)

    chat_features = [
        "In-Platform Partner Discussion Stream built directly into the workspace.",
        "Real-time message synchronization with timestamping.",
        "Eliminates the friction of sharing private personal phone numbers upfront.",
        "Maintains complete context of project specs alongside team discussions.",
        "Dedicated to matched collaborators only — closed to unauthorized users."
    ]
    for cf in chat_features:
        p = tf.add_paragraph()
        p.text = f"✔ {cf}"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 7: Technical Architecture
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, COLOR_WHITE)
    add_header(s7, "Technical Architecture & System Design")

    # 4 Stack Cards
    card_w = Inches(2.7)
    card_h = Inches(4.8)
    gap = Inches(0.28)

    # 1. Frontend
    add_card(s7, Inches(0.8), Inches(1.8), card_w, card_h)
    box = s7.shapes.add_textbox(Inches(0.95), Inches(2.0), Inches(2.4), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🌐 Frontend"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "Single Page App (SPA)",
        "Semantic HTML5 & Modern CSS3",
        "Reactive Vanilla JS Controller",
        "Responsive Grid Layout",
        "FontAwesome & Inter Typography",
        "Debounced Search Filtering"
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    # 2. Backend API
    add_card(s7, Inches(0.8 + 1*(2.7 + 0.28)), Inches(1.8), card_w, card_h)
    box = s7.shapes.add_textbox(Inches(0.95 + 1*(2.7 + 0.28)), Inches(2.0), Inches(2.4), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚡ Backend API"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "Node.js Runtime Environment",
        "Express.js Framework",
        "JWT Bearer Authentication",
        "Bcrypt Password Hashing",
        "CORS & Input Validation",
        "RESTful Endpoints Design"
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    # 3. Database Layer
    add_card(s7, Inches(0.8 + 2*(2.7 + 0.28)), Inches(1.8), card_w, card_h)
    box = s7.shapes.add_textbox(Inches(0.95 + 2*(2.7 + 0.28)), Inches(2.0), Inches(2.4), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🗄️ Database Layer"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(10)
    items = [
        "MongoDB NoSQL Database",
        "Mongoose ODM Models",
        "User & Role Schema",
        "Project Blueprint Schema",
        "Partnership Request Schema",
        "Collaboration Chat Schema"
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    # 4. Security & Dual Mode
    add_card(s7, Inches(0.8 + 3*(2.7 + 0.28)), Inches(1.8), card_w, card_h)
    box = s7.shapes.add_textbox(Inches(0.95 + 3*(2.7 + 0.28)), Inches(2.0), Inches(2.4), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🛡️ Dual-Mode Engine"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(10)
    items = [
        "Zero-Knowledge Idea Masking",
        "Role-Based Access Control",
        "Standalone Browser Execution (Indexed/Local fallback)",
        "Connected Full-Stack Mode",
        "Automated Seed Script",
        "Anti-Tamper Sanitization"
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = f"• {it}"
        p.font.size = Pt(12)
        p.space_after = Pt(6)

    # ==========================================
    # SLIDE 8: End-to-End User Flow
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, COLOR_WHITE)
    add_header(s8, "End-to-End User Journey")

    step_w = Inches(2.7)
    step_h = Inches(4.8)
    steps = [
        ("Step 1", "Register Profile", "Student registers with university email, academic department, year, and specific skill tags.", COLOR_NAVY),
        ("Step 2", "Post Project", "Student enters project title and private idea blueprint. Platform locks blueprint automatically.", COLOR_PRIMARY),
        ("Step 3", "Discovery & Proposal", "Peers view project title and compatibility match score (e.g. 92%). Peer sends partnership proposal.", COLOR_HIGHLIGHT),
        ("Step 4", "Unlock & Build", "Creator accepts proposal. Blueprint unlocks, and partners collaborate in the live chat workspace.", COLOR_ACCENT)
    ]

    for i, (num, title, desc, color) in enumerate(steps):
        x = Inches(0.8 + i*(2.7 + 0.28))
        add_card(s8, x, Inches(1.8), step_w, step_h)
        box = s8.shapes.add_textbox(x + Inches(0.15), Inches(2.0), Inches(2.4), Inches(4.3))
        tf = box.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = num.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.space_after = Pt(14)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_MUTED
        p.line_spacing = 1.3

    # ==========================================
    # SLIDE 9: Security & Privacy Guarantee
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, COLOR_WHITE)
    add_header(s9, "Security, Privacy & Intellectual Property Safeguards")

    # Top comparison table or security cards
    card_w = Inches(5.6)
    card_h = Inches(4.8)

    add_card(s9, Inches(0.8), Inches(1.8), card_w, card_h)
    box = s9.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🔒 Student Intellectual Property Protection"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(12)

    ip_points = [
        ("No Public Scraping", "API endpoints sanitize and remove description fields unless the request caller is the verified creator or accepted partner."),
        ("Proof of Idea Timestamp", "Cryptographic database timestamps prove priority of concept creation date."),
        ("Mutual Accountability", "Partners digitally accept mutual confidentiality before project specs are rendered."),
        ("Takedown & Reporting", "Students can report duplicate or plagiarized project titles directly to anonymous moderation.")
    ]
    for h, b in ip_points:
        p = tf.add_paragraph()
        p.text = f"✔ {h}: "
        p.font.bold = True
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_NAVY
        p2 = tf.add_paragraph()
        p2.text = f"    {b}"
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = COLOR_MUTED
        p2.space_after = Pt(6)

    add_card(s9, Inches(6.8), Inches(1.8), card_w, card_h)
    box = s9.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.0), Inches(4.3))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🛡️ Zero-Knowledge Administrative Policy"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(12)

    admin_points = [
        ("Zero Personal Data Collection", "The administration panel strictly redacts student names, emails, and phone numbers from telemetry."),
        ("Pseudonymized Token Auditing", "Accounts are inspected as tokens (e.g. STU_#4820), preserving unbiased platform governance."),
        ("Protected Blueprints", "Private idea descriptions are masked from administrators as well, ensuring complete student ownership."),
        ("Decentralized Safety Controls", "Administrators maintain safety and freeze malicious accounts without possessing user PII.")
    ]
    for h, b in admin_points:
        p = tf.add_paragraph()
        p.text = f"★ {h}: "
        p.font.bold = True
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_NAVY
        p2 = tf.add_paragraph()
        p2.text = f"    {b}"
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = COLOR_MUTED
        p2.space_after = Pt(6)

    # ==========================================
    # SLIDE 10: Summary & Conclusion
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, COLOR_NAVY)

    box = s10.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.333), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "SUMMARY & ROADMAP"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(100, 181, 246)
    p.space_after = Pt(12)

    p = tf.add_paragraph()
    p.text = "Empowering Students to Build Without Fear"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_after = Pt(20)

    p = tf.add_paragraph()
    p.text = "ProjectBuddy bridges the gap between creative student ideation and secure execution."
    p.font.size = Pt(18)
    p.font.color.rgb = RGBColor(220, 230, 242)
    p.space_after = Pt(24)

    summary_bullets = [
        "✅ Solved Idea Theft: Public title index + Encrypted idea description blueprint.",
        "✅ Solved Partner Finding: Automated skill-matching and interdisciplinary discovery.",
        "✅ Solved Safe Governance: Zero-knowledge anonymous administrative telemetry.",
        "✅ Future Roadmap: Inter-college hackathon integration, AI milestone synthesis, and GitHub repo sync."
    ]
    for b in summary_bullets:
        p = tf.add_paragraph()
        p.text = b
        p.font.size = Pt(15)
        p.font.color.rgb = COLOR_WHITE
        p.space_after = Pt(8)

    # Save presentation
    output_path = r"c:\project\ProjectBuddy_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully saved to: {output_path}")

if __name__ == "__main__":
    create_presentation()
