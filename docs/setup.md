# 🚀 Complete Setup Guide

This guide walks you through setting up the Coding Club Quiz Automation from scratch. Estimated time: **30 minutes**.

---

## 📋 What You'll Need

| Requirement | Details | Cost |
|---|---|---|
| Google Account | Personal Gmail (not college/org account) | Free |
| Groq API Key | For AI question generation | Free |
| Google Sheet | To log daily quiz links | Free |
| Google Apps Script | To run the automation | Free |
| Browser | Chrome recommended | Free |

> ⚠️ **Important:** Use a **personal Gmail account** only. College or organization accounts often have restrictions that block service account key creation and API access.

---

## Step 1 - Get Your Free Groq API Key

Groq provides free access to LLaMA 3.3 — the AI model that generates your quiz questions.

1. Go to 👉 [console.groq.com](https://console.groq.com)
2. Click **"Sign Up"** — use your Gmail account
3. No credit card required
4. Once logged in, click **"API Keys"** in the left sidebar
5. Click **"Create API Key"**
6. Give it a name like `quiz-bot`
7. **Copy the key immediately** — it starts with `gsk_...`

> 💡 Groq free tier gives **14,400 requests/day** and **6,000 tokens/minute** — more than enough for one daily quiz forever.

> ⚠️ **Security:** Never share your API key publicly. Never paste it in a GitHub repo, chat, or public document.

---

## Step 2 - Create Your Google Sheet

This sheet will automatically log every daily quiz — date, subject, topic, link, and tomorrow's topic.

1. Go to 👉 [sheets.google.com](https://sheets.google.com)
2. Click the **"+"** button to create a blank spreadsheet
3. Click **"Untitled spreadsheet"** at the top and rename it to `Quiz Log`
4. Look at the URL in your browser:

```
https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/edit
```

5. Copy the long string between `/d/` and `/edit` — that's your **Sheet ID**
6. Save it somewhere — you'll need it in Step 4

---

## Step 3 - Open Google Apps Script

1. Go to 👉 [script.google.com](https://script.google.com)
2. Click **"New Project"** (top left)
3. Click **"Untitled project"** at the top and rename it to `Quiz Bot`
4. You'll see a default `Code.gs` file with a blank `myFunction()` — delete everything inside

---

## Step 4 - Add the Script

1. Copy the full contents of [`script/Code.gs`](../script/Code.gs) from this repo
2. Paste it into the Apps Script editor (replacing the blank function)
3. Find these two lines near the top of `createDailyQuiz()`:

```javascript
var groqKey       = "gsk_YOUR_GROQ_KEY_HERE";
var spreadsheetId = "YOUR_GOOGLE_SHEET_ID_HERE";
```

4. Replace `gsk_YOUR_GROQ_KEY_HERE` with your actual Groq API key from Step 1
5. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your Sheet ID from Step 2
6. Also find the same `spreadsheetId` line inside `closeTodaysForm()` at the bottom and update it too
7. Press **Ctrl + S** (or Cmd + S on Mac) to save

---

## Step 5 - Authorize Permissions

The script needs permission to access your Google Forms, Sheets, and Drive.

1. In the function dropdown at the top, select **`createDailyQuiz`**
2. Click the **▶ Run** button
3. A popup will appear saying **"Authorization required"**
4. Click **"Review permissions"**
5. Choose your Google account
6. You may see **"Google hasn't verified this app"** — click **"Advanced"** → **"Go to Quiz Bot (unsafe)"**
7. Click **"Allow"**

> This is normal for personal Apps Script projects — Google shows this warning for any script you write yourself.

---

## Step 6 - Test Run

After authorizing, the script will run for the first time. Check the **Execution log** at the bottom — you should see:

```
✅ Using yesterday's promised topic for today.   (or "picked fresh" on first run)
📚 Today: Python → Python OOP & Classes
📅 Tomorrow: DBMS → SQL Queries & Joins
✅ Done! Quiz: https://forms.gle/xxxxxxxx
📢 Tell students tomorrow's topic: DBMS - SQL Queries & Joins
```

Then check your **Google Sheet** — a new row should appear with today's date and quiz link!

---

## Step 7 - Set Up Daily Triggers

This is what makes everything run automatically every day without any manual action.

1. In the Apps Script editor, click the **🕐 clock icon** (Triggers) in the left sidebar
2. Click **"+ Add Trigger"** button (bottom right corner)

### Trigger 1 — Create Daily Quiz at 6 PM

| Setting | Value |
|---|---|
| Choose which function to run | `createDailyQuiz` |
| Choose which deployment should run | Head |
| Select event source | Time-driven |
| Select type of time | Day timer |
| Select time of day | **6 PM to 7 PM** |

Click **Save**.

### Trigger 2 — Close Form at 10 PM

Click **"+ Add Trigger"** again:

| Setting | Value |
|---|---|
| Choose which function to run | `closeTodaysForm` |
| Choose which deployment should run | Head |
| Select event source | Time-driven |
| Select type of time | Day timer |
| Select time of day | **10 PM to 11 PM** |

Click **Save**.

> ✅ You're done! From now on, Google's servers run both functions automatically every day — your laptop doesn't need to be on.

---

## Step 8 - Customize for Your Club

### Change college names
Find this section in `Code.gs`:
```javascript
form.addListItem()
  .setTitle("College")
  .setChoiceValues([
    "TIT",
    "TIT Excellence",
    "TIT Science",
    "TIT Advance"
  ])
```
Replace the college names with your own.

### Add or remove subjects
Find the `subjectPool` object and edit it:
```javascript
var subjectPool = {
  "Your Subject Name": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ],
  // ... add more subjects
};
```

### Change number of questions
Find this line inside the `prompt` variable:
```javascript
`Generate 10 multiple choice coding quiz questions`
```
Change `10` to any number you want (recommended: 5–15).

### Change difficulty level
Find this line in the prompt:
```javascript
"Difficulty level: Easy to Medium only."
```
Change to `"Medium to Hard."` for tougher questions.

---

## Step 9 - Your Daily Routine (30 seconds)

Once everything is set up, your only job every day is:

1. Open your **Google Sheet** at 6 PM
2. Copy the **Quiz Link** from the new row → paste in your club WhatsApp group:
   ```
   🧠 Daily Quiz is live! Topic: [today's topic]
   👉 [quiz link]
   ⏰ Closes at 10 PM!
   ```
3. Copy the **"Notify Students 👇"** column → paste in WhatsApp:
   ```
   📢 Tomorrow's topic: [subject] - [topic]
   Start preparing! 💪
   ```

That's it - everything else is fully automatic!

---

## Verification Checklist

Before you finish setup, make sure:

- [ ] Groq API key is pasted correctly in both `groqKey` variables
- [ ] Sheet ID is pasted correctly in both `spreadsheetId` variables
- [ ] Test run completed successfully (quiz link appeared in sheet)
- [ ] `createDailyQuiz` trigger set to 6 PM – 7 PM
- [ ] `closeTodaysForm` trigger set to 10 PM – 11 PM
- [ ] College names updated to your own colleges
- [ ] Subjects/topics customized for your curriculum (optional)

---

## What Your Google Sheet Will Look Like

| Date | Today's Subject | Today's Topic | Quiz Link | Tomorrow's Subject | Tomorrow's Topic | Notify Students 👇 | Created At | Status |
|---|---|---|---|---|---|---|---|---|
| 01/08/2026 | Python | OOP & Classes | forms.gle/xx | DBMS | SQL Joins | 📢 Tomorrow: DBMS... | 18:03:21 | ✅ Active |
| 02/08/2026 | DBMS | SQL Joins | forms.gle/yy | Java | Collections | 📢 Tomorrow: Java... | 18:01:45 | 🔒 Closed at 22:04 |

---

## Troubleshooting

**Script fails with "This operation is not supported"**
> Some Apps Script methods don't exist. Make sure you're using the latest version of `Code.gs` from this repo.

**"API key not valid" error from Groq**
> Double check you copied the full key including `gsk_` prefix. Generate a new key if needed.

**Form closes but status column doesn't update**
> The `closeTodaysForm` function looks for forms created today in the "Coding Club Quizzes" Drive folder. Make sure the folder exists and hasn't been renamed.

**Duplicate quizzes being created**
> The date comparison only works if the date column contains a proper Date value, not a string. Delete duplicate rows manually and the script will self-correct.

**Quiz created but no link in sheet**
> The script crashed after creating the form but before writing to the sheet. Delete the orphaned form from Drive and run again.

---

## Need Help?

- Open an [Issue on GitHub](https://github.com/vaibhav44byte/coding-club-quiz-automation/issues)
- Check the [FAQ](faq.md)
- Check [Customization Guide](customization.md)
