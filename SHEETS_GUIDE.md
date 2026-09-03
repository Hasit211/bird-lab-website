# Editing the BIRD Lab website from Google Sheets

This site reads its content from **one Google Sheet**. You edit the sheet, and the
live website shows your changes on the next visit — **no coding, no developer, no
redeploy**.

- **Sheet being used:** the spreadsheet with ID `1rfeP7ny6xYqEe-5fVLqKpXLHGI2rGeQ8oZK0us6ADtE`
  (open it from your Google Drive).
- **When changes appear:** within about **5 minutes**. The site remembers the last
  version for 5 minutes so it loads fast; after that it fetches your latest edits.
  To see a change immediately, do a **hard refresh** (`Ctrl+Shift+R`, or `Cmd+Shift+R`
  on Mac).
- **If the sheet is ever offline or a tab is missing:** the site quietly shows its
  built-in default text instead of a blank page. It never breaks.

> This guide is the single reference for what to type and where. Read the three
> **Golden rules** first — they are the difference between "my edit worked" and
> "nothing happened."

---

## ⚠️ Golden rules (read these first)

**1. Tab names must match exactly.**
Each section of the site reads from a tab (the little sheet-name label at the
bottom of Google Sheets) with a specific name. `Events` works; `events`, `Event`,
or `Events ` (with a trailing space) do **not**. Capitalization and spelling must
match the table in this guide.

**2. Column headers (the first row) must match exactly.**
The site finds your data by the **header names in row 1**, not by position. If the
guide says the column is `Title`, it must say `Title` — not `title`, `Titles`, or
`Name of Event`. A misspelled header means that column is ignored.

**3. If a tab is missing or its headers are wrong, that section silently uses the
built-in defaults.**
Google has a quirk: when the site asks for a tab that doesn't exist, Google
returns *a different tab's* data instead of an error. To protect you from garbled
pages, the site checks that each tab has the right headers; if it doesn't, it
ignores that tab and shows the default text. **So "I created the tab but nothing
changed" almost always means a tab-name or header typo.** Compare against this
guide character by character.

---

## ✅ What still needs to be set up

The site works today on built-in defaults. To make the sheet actually drive it,
someone needs to do the following **once**:

| Task | Status | What to do |
|---|---|---|
| Share the sheet | **Required once** | Share → General access → **Anyone with the link → Viewer**. Without this the site can't read the sheet at all. |
| `People` tab | ✅ Already exists and works | — |
| `Collaborations` tab | ⚠️ Exists but **wrong layout** | Rebuild it with the columns shown in [Collaborations](#tab-collaborations). Its current layout (National/International groupings) is not readable by the site. |
| `Content` tab | ❌ Does not exist yet | Create it — this controls **all headings and paragraphs**. See [Content](#tab-content). |
| `Events` tab | ❌ Does not exist yet | Create it. See [Events](#tab-events). |
| `Positions` tab | ❌ Does not exist yet | Create it. See [Positions](#tab-positions). |
| `Courses` tab | ❌ Does not exist yet | Create it. See [Courses](#tab-courses). |
| `ResearchAreas` tab | ❌ Does not exist yet | Create it. See [ResearchAreas](#tab-researchareas). |
| `Facilities` tab | ❌ Does not exist yet | Create it. See [Facilities](#tab-facilities). |

Until a tab is created correctly, its section just keeps showing the built-in
default content — nothing breaks.

### One-time: share the sheet

1. Open the sheet in Google Sheets.
2. Click **Share** (top right).
3. Under **General access**, change "Restricted" to **Anyone with the link**.
4. Set the role to **Viewer** (not Editor — the public should only read it).
5. Click **Done**.

You only do this once. Editing rights stay with you; the public link is read-only.

---

## 🖼️ How to add an image (any tab with an image column)

You have two options for any image cell (`Photo` on People, `Image` on Events /
Collaborations / Facilities):

**Option A — a public image URL.**
Paste a direct link that ends in `.jpg`, `.png`, etc. (for example an image already
hosted on a website). Paste it straight into the cell.

**Option B — a Google Drive link (recommended for your own photos).**
1. Upload the photo to Google Drive.
2. Right-click it → **Share** → **General access → Anyone with the link → Viewer**.
3. Click **Copy link** and paste that link into the image cell.

The site automatically converts a Drive share link into a displayable image — you
do **not** need to change the link format yourself. Just make sure the photo itself
is shared "Anyone with the link," or it will show as broken.

**If you leave an image cell blank:** People falls back to a bundled photo named
after the person if one exists, otherwise a neutral placeholder; other sections
show a neutral placeholder. Blank is safe — it never breaks the page.

---

## 📋 Tab-by-tab reference

Legend: **Bold** columns are required for the tab to be recognized (they are the
headers the site checks). Other columns are optional — leave a cell blank to omit
it.

---

<a name="tab-content"></a>
### `Content` — every heading and paragraph on the site

This one tab controls **all the wording** on the site: page titles, subtitles,
mission/vision text, button labels, contact details, footer text, and so on.

**Columns (row 1 must read exactly):**

| Page | **Key** | **Text** |
|---|---|---|

- **`Page`** — just a label to help *you* find rows (e.g. "Welcome", "Footer"). The
  site ignores it; group your rows however is easiest to read.
- **`Key`** — the exact code that identifies the piece of text. **Must match the
  keys below exactly.** This is how the site knows which text goes where.
- **`Text`** — what you want shown. Edit this column freely.

To change a piece of text, find its `Key` below, put it in the `Key` column, and
put your wording in the `Text` column. If a key is missing from the sheet, the site
uses the built-in default shown here — so you only need to add rows for text you
actually want to change (though adding all of them makes future edits easier).

> Tip: set up the three columns `Page | Key | Text` in row 1, then copy every key
> below in as the starting point. The `Text` values below are exactly what the site
> shows today.

#### Page: Header
| Key | Text (current value) |
|---|---|
| `header.logo` | BIRDLab |

#### Page: Hero (top of home page)
| Key | Text (current value) |
|---|---|
| `hero.badge` | Next-Gen BIRD Lab |
| `hero.subtitle` | Pioneering the future through nature-inspired robotics research. From bio-inspired mechanisms to collaborative systems, we're developing the next generation of adaptive robotics technology. |
| `hero.scroll` | Discover Our Innovation |

#### Page: Welcome
| Key | Text (current value) |
|---|---|
| `welcome.title` | Welcome to BIRD Lab for your research |
| `welcome.subtitle` | Leading the advancement of bio-inspired robotics through innovative research, nature-inspired design, and cutting-edge technology solutions |
| `welcome.mission.title` | Our Mission |
| `welcome.mission.text` | To advance bio-inspired robotics research and develop adaptive systems that learn from nature to solve real-world challenges through innovative design and collaboration. |
| `welcome.vision.title` | Our Vision |
| `welcome.vision.text` | To be a globally recognized center of excellence in bio-inspired robotics, fostering innovation in wearable, collaborative, and reconfigurable robotic systems. |
| `welcome.values.title` | Our Values |
| `welcome.values.text` | Bio-inspiration, innovation, collaboration, and ethical responsibility guide our research in developing nature-inspired solutions for tomorrow's challenges. |

#### Page: Welcome — Features boxes
| Key | Text (current value) |
|---|---|
| `features.title` | Advanced Research Capabilities |
| `features.subtitle` | From autonomous systems to AI-powered robotics, our laboratory leads innovation in cutting-edge research and development. |
| `features.item1.title` | Advanced Robotics Research |
| `features.item1.desc` | Cutting-edge research in autonomous systems, machine learning, and bio-inspired robotics. |
| `features.item2.title` | AI-Powered Vision Systems |
| `features.item2.desc` | Computer vision and deep learning solutions for real-world applications. |
| `features.item3.title` | Research Publications |
| `features.item3.desc` | Discover our latest research findings and breakthrough innovations in robotics. |
| `features.item4.title` | Global Collaboration |
| `features.item4.desc` | Partnering with institutions worldwide to advance robotics research and innovation. |

#### Page: Research
| Key | Text (current value) |
|---|---|
| `research.title` | Research Areas |
| `research.subtitle` | Exploring cutting-edge technologies and methodologies to advance the field of robotics |
| `research.highlight.title` | Current Focus: Bio-Inspired Autonomous Systems |
| `research.highlight.text` | Our latest research initiative combines principles from biology and artificial intelligence to create robots that can adapt and learn from their environment, much like living organisms. This interdisciplinary approach is opening new frontiers in robotics. |
| `research.highlight.stat1.value` | 5 |
| `research.highlight.stat1.label` | Active Projects |
| `research.highlight.stat2.value` | $2M |
| `research.highlight.stat2.label` | Funding Secured |
| `research.highlight.stat3.value` | 3 |
| `research.highlight.stat3.label` | Industry Partners |

> The five research-area cards themselves (titles, descriptions, icons) live in the
> separate [`ResearchAreas`](#tab-researchareas) tab, not here.

#### Page: People
| Key | Text (current value) |
|---|---|
| `people.title` | Our Team |
| `people.subtitle` | Meet the brilliant minds driving innovation in robotics research |
| `people.join.title` | Join Our Team |
| `people.join.text` | We're always looking for passionate researchers and students to join our team. Explore opportunities to work on cutting-edge robotics projects and contribute to groundbreaking research. |
| `people.join.btnPrimary` | View Open Positions |
| `people.join.btnSecondary` | Contact Us |

> The team members themselves live in the [`People`](#tab-people) tab.

#### Page: Lectures / Courses
| Key | Text (current value) |
|---|---|
| `lectures.title` | Courses & Curriculum |
| `lectures.subtitle` | Explore our comprehensive course offerings in robotics, mechatronics, and related technologies |

#### Page: Collaboration (Gallery)
| Key | Text (current value) |
|---|---|
| `gallery.title` | Collaboration |
| `gallery.subtitle` | Explore our laboratory, projects, and research in action |

#### Page: Facilities
| Key | Text (current value) |
|---|---|
| `facilities.title` | Lab Facilities |
| `facilities.subtitle` | State-of-the-art equipment and infrastructure for cutting-edge research |

#### Page: Open Positions
| Key | Text (current value) |
|---|---|
| `positions.title` | Open Positions |
| `positions.subtitle` | Join our research team and contribute to cutting-edge robotics research |

#### Page: Events
| Key | Text (current value) |
|---|---|
| `events.title` | Recent Events |
| `events.subtitle` | Stay updated with our latest conferences, workshops, and academic activities |

#### Page: Contact
| Key | Text (current value) |
|---|---|
| `contact.title` | Contact Us & Open Positions |
| `contact.subtitle` | Get in touch with our research team for collaborations, questions, or opportunities |
| `contact.banner.title` | Open Research Positions Available |
| `contact.banner.text` | We are accepting applications for Undergraduate Internships, Master's/Ph.D. Programs, Post-Doctoral Positions, and Research Positions. Use the form below to apply or inquire about opportunities. |
| `contact.banner.contactName` | Dr. Bhivraj Suthar |
| `contact.banner.contactEmail` | bhivraj@iitj.ac.in |
| `contact.form.title` | Send us a Message |
| `contact.form.subtitle` | We'll get back to you as soon as possible |
| `contact.info.title` | Get in Touch |
| `contact.info.subtitle` | Find us at our campus location or reach out directly |
| `contact.address.building` | SAIDE ,IIT Jodhpur Permanent Campus |
| `contact.address.street` | National Highway 65, Nagaur Road, Karwar |
| `contact.address.city` | Jodhpur |
| `contact.address.country` | India |
| `contact.phone` | +1 (555) 123-4567 |
| `contact.email` | info@birdlab.edu |
| `contact.officeHours` | Monday - Friday: 9:00 AM - 5:00 PM |

> **Note:** `contact.phone` and `contact.email` are placeholder values. Add these
> rows with the lab's real phone and email — they also appear in the footer.

#### Page: Social links
| Key | Text (current value) |
|---|---|
| `social.linkedin` | *(blank — the LinkedIn icon is hidden until you add a URL here)* |
| `social.youtube` | https://www.youtube.com/@bhivrajsuthar2234 |

> Social icons only appear when their URL is filled in. Leave a cell blank to hide
> that icon.

#### Page: Footer
| Key | Text (current value) |
|---|---|
| `footer.logo` | BIRD Lab |
| `footer.description` | Advancing bio-inspired robotics through innovative research, nature-inspired design, and collaborative partnerships. |
| `footer.research1` | Bio-inspired Mechanisms |
| `footer.research2` | Wearable & Collaborative Robotics |
| `footer.research3` | Reconfigurable and Growing Robotics |
| `footer.research4` | Tele-Robotics and Haptics |
| `footer.research5` | Applied AI in Robotics |
| `footer.copyright` | Bio-Inspired Robotics Design Lab (BIRD Lab). All rights reserved. |

---

<a name="tab-people"></a>
### `People` — team members  *(already set up)*

This tab already exists and works. Add a row per person. Photos come from the
`Photo` column (see [How to add an image](#️-how-to-add-an-image-any-tab-with-an-image-column)).

**Required columns:** `Title`, `Name`

**All columns (row 1, exactly as spelled — note "Institutaion" is intentionally
kept to match the existing tab):**

`Title`, `Name`, `Photo`, `Research Interests/Project`, `Email`,
`Post & Current Affiliation`, `Education (PhD)`, `Institutaion`, `Year`,
`Education (MTech/MS)`, `Institutaion`, `Year`, `Education (BTech/BE)`,
`Institutaion`, `Year`, `Linkedin`

> The three `Institutaion`/`Year` pairs sit immediately to the right of each
> `Education (...)` column — keep that order.

**The `Title` column decides which section a person appears under.** Use one of
these exact values (not case-sensitive):

| Type in `Title` | Appears under heading |
|---|---|
| `Professor` | Professor |
| `Post-doctoral Researcher` | Post-doctoral Researchers |
| `Ph.D` | PhD Students |
| `Junior Research Fellow` | Junior Research Fellows |
| `Master Student` | Master Students |
| `Graduate Student` | Graduate Students |
| `Web Master` | Web Masters |
| `Alumni` | Alumni |
| *(anything else)* | Other Team Members |

- `Research Interests/Project` — separate multiple interests with commas or
  semicolons; they display as a list.
- A section only appears when it has at least one person.

---

<a name="tab-events"></a>
### `Events` — conferences, workshops, talks

**Required columns:** `Title`, `Date`

| Column | Required | Notes |
|---|---|---|
| `Title` | ✅ | Event name. A row with no Title is skipped. |
| `Date` | ✅ | Free text, e.g. `March 15-17, 2025`, `February 10, 2025`, or `2025-03-17`. **The site reads this to decide "Upcoming" vs "Past" automatically** — for a date range it uses the last day, so an event stays "Upcoming" through its final day and flips to "Past" the day after. |
| `Location` | | e.g. `IIT Jodhpur, India`. |
| `Description` | | One paragraph. |
| `Image` | | Image URL or Drive link. Blank = placeholder. |
| `Category` | | e.g. `Conference`, `Workshop`, `Lecture`. Defaults to `Event`. |
| `Status` | | **Normally leave this blank** — the Upcoming/Past badge and filter are worked out from `Date` automatically, so it never goes stale. If you *do* type `Upcoming` or `Past`, that value is forced and overrides the date; use it only to override a special case (e.g. a `TBD` date, or to keep a recurring event marked `Upcoming`), and remember to clear it afterwards or it can itself go out of date. |

**Starting rows (current built-in events):**

| Title | Date | Location | Category |
|---|---|---|---|
| International Robotics Conference 2025 | March 15-17, 2025 | IIT Jodhpur, India | Conference |
| Workshop on Wearable Robotics | February 10, 2025 | BIRD Lab, IIT Jodhpur | Workshop |
| Guest Lecture: Dr. Sarah Chen | January 28, 2025 | Online | Lecture |
| BIRD Lab Open House 2024 | December 5, 2024 | BIRD Lab, IIT Jodhpur | Event |
| ICRA 2024 Participation | May 13-17, 2024 | Yokohama, Japan | Conference |

(Add `Description` and `Image` for each as you like.)

---

<a name="tab-collaborations"></a>
### `Collaborations` — partner institutions  *(needs rebuilding)*

⚠️ **This tab exists but is laid out in a way the site can't read** (rows grouped
under "National"/"International"). Replace its contents with the simple column
layout below.

**Required columns:** `Name`, `Category`

| Column | Required | Notes |
|---|---|---|
| `Name` | ✅ | Institution name. |
| `Category` | ✅ | Free label, e.g. `Collaboration` or `Industry Collaboration`. Defaults to `Collaboration`. |
| `Image` | | Logo — image URL or Drive link. Blank = placeholder. |
| `URL` | | Optional link to the partner's site. |

**Starting rows (current built-in collaborations):**

| Name | Category |
|---|---|
| Sogang | Collaboration |
| Khalifa University | Collaboration |
| IIT Delhi | Collaboration |
| IIT Gandhinagar | Collaboration |
| University of Siena | Collaboration |
| KAIST | Collaboration |
| CNU, Korea | Collaboration |
| Jaipur Foot | Industry Collaboration |

---

<a name="tab-positions"></a>
### `Positions` — open positions

**Required columns:** `Title`, `Summary`

| Column | Required | Notes |
|---|---|---|
| `Title` | ✅ | Position title. A row with no Title is skipped. |
| `Summary` | ✅ | Short line of available positions. |
| `Type` | | Small badge label. Defaults to `Available`. |
| `Department` | | e.g. `Multiple Positions Available`. |
| `Details` | | Longer paragraph. |
| `Email` | | Contact email; also becomes the "Send Email" button. |
| `Contact` | | Contact person's name. |
| `Status` | | Optional label. |

**Starting row (current built-in position):**

| Title | Type | Department | Summary | Contact | Email |
|---|---|---|---|---|---|
| Research Opportunities | Available | Multiple Positions Available | Undergraduate internship, Master's/Ph.D. courses, post-doc and Research positions | Dr. Bhivraj Suthar | bhivraj@iitj.ac.in |

(Details for that row: *"We have open positions for students interested in applying
for undergraduate internship, Master's/Ph.D. courses, post-doc and Research
positions."*)

---

<a name="tab-courses"></a>
### `Courses` — lectures & curriculum

**Required columns:** `Title`, `Code`

| Column | Required | Notes |
|---|---|---|
| `Title` | ✅ | Course name. A row with no Title is skipped. |
| `Code` | ✅ | Course code, e.g. `MEL7080`. |
| `Credits` | | e.g. `3 (3-0-0)`. |
| `Department` | | e.g. `AIDE`, `IDRP-RMS`, `MedTech`, `ME`. Powers the department filter. |
| `Level` | | `Undergraduate` or `Postgraduate`. Powers the level filter. Defaults to Postgraduate. |
| `Description` | | One paragraph. |

**Starting rows (current built-in courses):**

| Code | Title | Credits | Department | Level |
|---|---|---|---|---|
| CSL7570 | Introduction to Augmented Reality and Virtual Reality | 3 (3-0-0) | AIDE | Postgraduate |
| MEL7080 | Robotics | 3-0-2 | IDRP-RMS | Postgraduate |
| RML6010 | Introduction to Robotics | 3 (3-0-0) | IDRP-RMS | Undergraduate |
| SHL7350 | Wearable Devices | 2 | MedTech | Postgraduate |
| MEL6080 | Mechatronics | 3 (2-0-2) | ME | Undergraduate |
| RML7360 | Tele Robotics | 3 | IDRP-RMS | Postgraduate |

---

<a name="tab-researchareas"></a>
### `ResearchAreas` — the research-area cards

**Required columns:** `Title`, `Description`

| Column | Required | Notes |
|---|---|---|
| `Title` | ✅ | Area name. A row with no Title is skipped. |
| `Description` | ✅ | The full description shown on the card. |
| `Icon` | | A single emoji shown on the card. Defaults to 🔬. |

**Starting rows (current built-in research areas):**

| Icon | Title |
|---|---|
| 🦋 | Bio-inspired Mechanisms |
| 🤝 | Wearable Robotics (Bio-signal-controlled Robotics) |
| 🔄 | Reconfigurable and Growing Robotics |
| 🎮 | Tele-Robotics and Haptics |
| 🧠 | Applied AI in Robotics |

The current descriptions are long paragraphs. If you create this tab, copy the
descriptions from the live site (or the developer can paste the current text). If
you leave the tab uncreated, the site keeps showing these five areas with their
existing descriptions.

---

<a name="tab-facilities"></a>
### `Facilities` — equipment & infrastructure

**Required columns:** `Name`, `Category`

| Column | Required | Notes |
|---|---|---|
| `Name` | ✅ | Equipment name. A row with no Name is skipped. |
| `Category` | ✅ | e.g. `3D Printing`, `Electronics`, `Actuators`. Powers the category filter. Defaults to `General`. |
| `Image` | | Photo — image URL or Drive link. Blank = placeholder. |
| `Description` | | Optional paragraph shown when the item is opened. |
| `Specs` | | Specifications — **one `Label: value` per line inside the cell** (press `Alt+Enter` / `Option+Enter` for a line break within a cell). Example below. |

**Example `Specs` cell** (a single cell containing multiple lines):

```
Build volume: 300 × 300 × 300 mm
Nozzle diameter: 0.4 mm
Max nozzle temperature: 280 °C
Materials Supported: PLA, ABS, PETG, TPU
```

There are 10 built-in facilities today (Bamboo Labs X1 E, Pratham 3.0, Phrozen
Sonic Mega 8K V2, Anycubic Kobra 2 Neo, Scientech 827 Workbench, ESD Workstation,
Electric Wheelchair and Treadmill, Myrio 1900, CubeMars AK Series Actuators,
Metallic Breadboard). If you leave this tab uncreated, all ten keep showing. Once
you create the tab correctly, the sheet fully replaces the built-in list.

---

## 🔧 Troubleshooting

| Problem | Most likely cause |
|---|---|
| "I edited the sheet but the site didn't change." | Wait 5 minutes, then hard-refresh (`Ctrl+Shift+R`). If still nothing → tab name or a header is misspelled (Golden rules 1 & 2). |
| "A whole section shows the old default text." | That tab doesn't exist yet, or its required headers are wrong. Compare the tab name and row-1 headers to this guide exactly. |
| "A photo shows as broken / a grey box." | The image link isn't public. For Drive, re-share the photo as **Anyone with the link → Viewer**. |
| "A person isn't showing up." | Their row has no `Name`, or their `Title` doesn't match a known value — they'll land under "Other Team Members." |
| "A social icon disappeared." | Its URL cell in `Content` is blank — that hides the icon by design. |
| "Nothing on the whole site reads from the sheet." | The sheet isn't shared publicly. Do the [one-time share step](#one-time-share-the-sheet). |

### The rule of thumb
If a section isn't updating, it's almost always a **tab-name typo** or a
**header-spelling typo**. The site is built to fall back to safe defaults rather
than show errors, so a silent "no change" is the symptom of a mismatch — not a
broken website.
