// ── TOPIC TRACKING SYSTEM ──────────────────────────
function getUsedSubjects(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var usedSubjects = [];
  for (var i = 2; i <= lastRow; i++) {
    var subject = sheet.getRange(i, 2).getValue();
    if (subject) usedSubjects.push(subject);
  }
  return usedSubjects;
}

function pickNextSubject(subjectPool, usedSubjects) {
  var allSubjects = Object.keys(subjectPool);
  var remaining = allSubjects.filter(function(s) {
    return usedSubjects.indexOf(s) === -1;
  });
  if (remaining.length === 0) {
    Logger.log("🔄 All subjects covered! Starting new cycle...");
    remaining = allSubjects;
  }
  var randomIndex = Math.floor(Math.random() * remaining.length);
  return remaining[randomIndex];
}

function pickNextSubjectForTomorrow(subjectPool, usedSubjects, todaySubject) {
  var allSubjects = Object.keys(subjectPool);
  var remaining = allSubjects.filter(function(s) {
    return usedSubjects.indexOf(s) === -1 && s !== todaySubject;
  });
  if (remaining.length === 0) {
    remaining = allSubjects.filter(function(s) {
      return s !== todaySubject;
    });
  }
  var randomIndex = Math.floor(Math.random() * remaining.length);
  return remaining[randomIndex];
}

function isSameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
// ───────────────────────────────────────────────────

function createDailyQuiz() {
  var today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric'
  });

  var groqKey = "gsk_YOUR_GROQ_KEY_HERE";
  var spreadsheetId = "YOUR_SHEET_ID_HERE";

  var subjectPool = {
    "Operating Systems": [
      "Process Management & Scheduling",
      "Memory Management & Virtual Memory",
      "File Systems & I/O Management",
      "Deadlocks & Synchronization",
      "CPU Scheduling Algorithms"
    ],
    "DBMS": [
      "SQL Queries & Joins",
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "Transactions & ACID Properties",
      "Indexing & Query Optimization",
      "ER Diagrams & Relational Model"
    ],
    "Computer Networks": [
      "OSI & TCP/IP Model",
      "IP Addressing & Subnetting",
      "Routing Algorithms & Protocols",
      "TCP vs UDP & Socket Programming",
      "HTTP, DNS, FTP & Application Layer"
    ],
    "Computer Organization & Architecture": [
      "Number Systems & Boolean Algebra",
      "CPU Design & Instruction Set",
      "Memory Hierarchy & Cache",
      "Pipeline & Parallel Processing",
      "I/O Organization & Interrupts"
    ],
    "Data Structures & Algorithms": [
      "Arrays, Linked Lists & Stacks",
      "Trees & Binary Search Trees",
      "Graphs & BFS/DFS",
      "Sorting & Searching Algorithms",
      "Dynamic Programming & Greedy"
    ],
    "Competitive Programming": [
      "Time & Space Complexity Analysis",
      "Recursion & Backtracking",
      "Bit Manipulation",
      "Sliding Window & Two Pointers",
      "Divide & Conquer"
    ],
    "Python": [
      "Python OOP & Classes",
      "File Handling & Exception Handling",
      "List Comprehensions & Generators",
      "Python Libraries (NumPy, Pandas basics)",
      "Decorators, Iterators & Lambda"
    ],
    "Java": [
      "Java OOP & Inheritance",
      "Collections Framework",
      "Multithreading & Concurrency",
      "Exception Handling & I/O Streams",
      "Java 8 Features (Streams, Lambda)"
    ],
    "Web Development": [
      "HTML5 & CSS3 Fundamentals",
      "JavaScript ES6+ Features",
      "REST APIs & HTTP Methods",
      "React & Frontend Basics",
      "Web Security & Authentication"
    ],
    "AI & Machine Learning": [
      "Supervised vs Unsupervised Learning",
      "Linear & Logistic Regression",
      "Neural Networks & Deep Learning Basics",
      "Decision Trees & Random Forests",
      "Model Evaluation & Overfitting",
      "NLP Basics & Text Processing",
      "CNNs & Image Classification Basics"
    ],
    "Custom": [
      "Git & GitHub Best Practices",
      "Linux Commands & Shell Scripting",
      "System Design Basics",
      "Design Patterns (Singleton, Factory etc)",
      "Cloud Computing Fundamentals"
    ]
  };

  // ── OPEN SHEET ─────────────────────────────────────
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date", "Today's Subject", "Today's Topic",
      "Quiz Link", "Tomorrow's Subject", "Tomorrow's Topic",
      "Notify Students 👇", "Created At", "Status"
    ]);
  }

  // ── SKIP IF TODAY'S QUIZ ALREADY EXISTS ────────────
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var lastEntryDateRaw = sheet.getRange(lastRow, 1).getValue();
    var lastEntryDateObj = (lastEntryDateRaw instanceof Date)
      ? lastEntryDateRaw
      : new Date(lastEntryDateRaw);
    var todayDate = new Date();

    if (!isNaN(lastEntryDateObj) && isSameDate(lastEntryDateObj, todayDate)) {
      Logger.log("⚠️ Today's quiz already exists! Skipping duplicate.");
      Logger.log("📋 Today's link: " + sheet.getRange(lastRow, 4).getValue());
      Logger.log("📢 Tomorrow: " + sheet.getRange(lastRow, 7).getValue());
      return;
    }
  }

  // ── DECIDE TODAY'S TOPIC ───────────────────────────
  var usedSubjects = getUsedSubjects(sheet);
  var todaySubject, todayTopic;

  if (lastRow > 1) {
    var promisedSubject = sheet.getRange(lastRow, 5).getValue();
    var promisedTopic   = sheet.getRange(lastRow, 6).getValue();

    if (promisedSubject && promisedTopic && subjectPool[promisedSubject] &&
        subjectPool[promisedSubject].indexOf(promisedTopic) !== -1) {
      todaySubject = promisedSubject;
      todayTopic   = promisedTopic;
      Logger.log("✅ Using yesterday's promised topic for today.");
    }
  }

  if (!todaySubject) {
    todaySubject = pickNextSubject(subjectPool, usedSubjects);
    var todayTopics = subjectPool[todaySubject];
    todayTopic = todayTopics[Math.floor(Math.random() * todayTopics.length)];
    Logger.log("ℹ️ No valid promised topic found, picked fresh.");
  }

  // ── PICK TOMORROW'S TOPIC ──────────────────────────
  var usedSubjectsIncludingToday = usedSubjects.concat([todaySubject]);
  var tomorrowSubject = pickNextSubjectForTomorrow(subjectPool, usedSubjectsIncludingToday, todaySubject);
  var tomorrowTopics  = subjectPool[tomorrowSubject];
  var tomorrowTopic   = tomorrowTopics[Math.floor(Math.random() * tomorrowTopics.length)];

  Logger.log("📚 Today: " + todaySubject + " → " + todayTopic);
  Logger.log("📅 Tomorrow: " + tomorrowSubject + " → " + tomorrowTopic);

  // ── GENERATE QUIZ ──────────────────────────────────
  // IMPORTANT: prompt explicitly asks for answer as a NUMBER
  var prompt = `Generate 10 multiple choice coding quiz questions for ${today}.
Subject: ${todaySubject}
Topic: ${todayTopic}
Difficulty level: Easy to Medium only.
Target audience: 2nd and 3rd year college CS/IT students.
Guidelines:
- Questions should test fundamental understanding, not expert-level tricks
- Avoid overly complex or tricky edge cases
- Each question should be solvable by a student who has studied the topic once
- Mix conceptual questions (60%) with practical/application questions (40%)
- Options should be clearly distinct, not confusingly similar
Return ONLY valid JSON, no markdown, no extra text.
The "answer" field MUST be an integer (0, 1, 2, or 3) — NOT a string.
{
  "title": "Daily Quiz - ${todaySubject}: ${todayTopic}",
  "questions": [
    {
      "question": "Sample question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2
    }
  ]
}
answer is the 0-based INTEGER index of the correct option. Never use quotes around the answer value.`;

  var quiz = null;
  var attempts = 0;
  while (attempts < 3 && !quiz) {
    attempts++;
    try {
      var response = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "post",
        headers: {
          "Authorization": "Bearer " + groqKey,
          "Content-Type": "application/json"
        },
        payload: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        }),
        muteHttpExceptions: true
      });

      var data = JSON.parse(response.getContentText());
      var text = data.choices[0].message.content.trim();
      text = text.replace(/```json|```/g, "").trim();
      var jsonStart = text.indexOf("{");
      var jsonEnd   = text.lastIndexOf("}") + 1;
      text = text.substring(jsonStart, jsonEnd);
      quiz = JSON.parse(text);

      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error("No questions in parsed quiz");
      }

      // ── VALIDATE every answer index is a valid number ──
      for (var v = 0; v < quiz.questions.length; v++) {
        var answerIndex = parseInt(quiz.questions[v].answer, 10);
        if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
          throw new Error("Invalid answer index at question " + (v + 1) + ": " + quiz.questions[v].answer);
        }
        quiz.questions[v].answer = answerIndex; // normalise to integer
      }

    } catch (e) {
      Logger.log("⚠️ Attempt " + attempts + " failed: " + e.message);
      quiz = null;
    }
  }

  if (!quiz) {
    Logger.log("❌ Failed to generate valid quiz after 3 attempts. No row written.");
    return;
  }

  // ── CREATE GOOGLE FORM ─────────────────────────────
  var form = FormApp.create(quiz.title);
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setShowLinkToRespondAgain(false);

  // Info section
  form.addTextItem().setTitle("Full Name").setRequired(true);
  form.addTextItem().setTitle("Email ID").setRequired(true);

  form.addListItem()
    .setTitle("Year")
    .setChoiceValues(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .setRequired(true);

  form.addListItem()
    .setTitle("College")
    .setChoiceValues(["TIT", "TIT Excellence", "TIT Science", "TIT Advance"])
    .setRequired(true);

  form.addPageBreakItem()
    .setTitle("📝 Quiz Questions")
    .setHelpText("Answer all 10 questions carefully. Form closes at 10 PM!");

  // Quiz questions — parseInt fix applied here
  quiz.questions.forEach(function(q, index) {
    var correctIndex = parseInt(q.answer, 10); // ✅ THE KEY FIX — always a number

    var item = form.addMultipleChoiceItem();
    item.setTitle((index + 1) + ". " + q.question);
    item.setRequired(true);
    item.setPoints(1); // each question = 1 point → total 10/10

    var choices = q.options.map(function(opt, i) {
      return item.createChoice(opt, i === correctIndex); // ✅ correct comparison
    });
    item.setChoices(choices);

    item.setFeedbackForCorrect(
      FormApp.createFeedback()
        .setText("✅ Correct!")
        .build()
    );
    item.setFeedbackForIncorrect(
      FormApp.createFeedback()
        .setText("❌ Incorrect. Correct answer: " + q.options[correctIndex]) // ✅ uses correctIndex
        .build()
    );
  });

  var formUrl  = form.getPublishedUrl();
  var shortUrl = form.shortenFormUrl(formUrl);

  // ── SAVE TO SHEET ──────────────────────────────────
  sheet.appendRow([
    new Date(),
    todaySubject,
    todayTopic,
    shortUrl,
    tomorrowSubject,
    tomorrowTopic,
    "📢 Tomorrow: " + tomorrowSubject + " - " + tomorrowTopic,
    new Date().toLocaleTimeString(),
    "✅ Active"
  ]);

  // ── ORGANIZE IN DRIVE FOLDER ───────────────────────
  var folders = DriveApp.getFoldersByName("Coding Club Quizzes");
  var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder("Coding Club Quizzes");
  var formFile = DriveApp.getFileById(form.getId());
  folder.addFile(formFile);
  DriveApp.getRootFolder().removeFile(formFile);

  Logger.log("✅ Done! Quiz: " + shortUrl);
  Logger.log("📢 Tell students tomorrow's topic: " + tomorrowSubject + " - " + tomorrowTopic);
}

// ── CLOSE TODAY'S FORM AT 10 PM ────────────────────
function closeTodaysForm() {
  var spreadsheetId = "YOUR_SHEET_ID_HERE";
  var ss    = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) { Logger.log("❌ No quiz found to close."); return; }

  var folders = DriveApp.getFoldersByName("Coding Club Quizzes");
  if (!folders.hasNext()) { Logger.log("❌ Folder not found."); return; }

  var folder = folders.next();
  var files  = folder.getFiles();
  var closedCount = 0;
  var todayDate = new Date();

  while (files.hasNext()) {
    var file     = files.next();
    var fileDate = new Date(file.getDateCreated());

    if (isSameDate(fileDate, todayDate)) {
      try {
        var form = FormApp.openById(file.getId());
        form.setAcceptingResponses(false);
        Logger.log("🔒 Closed: " + form.getTitle());
        closedCount++;
      } catch (e) {
        Logger.log("⚠️ Skipped: " + file.getName());
      }
    }
  }

  if (closedCount > 0) {
    sheet.getRange(lastRow, 9).setValue("🔒 Closed at " + new Date().toLocaleTimeString());
    Logger.log("✅ " + closedCount + " form(s) closed!");
  } else {
    Logger.log("❌ No forms found for today.");
  }
}
function generateWeeklyReport() {

  var spreadsheetId = "YOUR_SHEET_ID_HERE";
  var ss = SpreadsheetApp.openById(spreadsheetId);

  // Quiz log sheet
  var logSheet = ss.getSheetByName("Sheet1"); // Rename if your sheet name changes

  // Report sheet
  var reportSheet = ss.getSheetByName("📊 Weekly Report");

  if (!reportSheet) {
    reportSheet = ss.insertSheet("📊 Weekly Report");
  } else {
    reportSheet.clear();
  }

  // Headers
  reportSheet.appendRow([
    "Quiz Date",
    "Subject",
    "Topic",
    "Total Responses",
    "Student Names",
    "Quiz Link"
  ]);

  var lastRow = logSheet.getLastRow();

  if (lastRow == 0) {
    Logger.log("No quiz data found.");
    return;
  }

  // Last 7 quizzes
  var startRow = Math.max(1, lastRow - 6);

  for (var i = startRow; i <= lastRow; i++) {

    var quizDate = logSheet.getRange(i, 1).getDisplayValue();
    var subject  = logSheet.getRange(i, 2).getValue();
    var topic    = logSheet.getRange(i, 3).getValue();
    var quizLink = logSheet.getRange(i, 4).getValue();

    var responseCount = 0;
    var studentNames = [];

    try {

      // Find all forms
      var folders = DriveApp.getFoldersByName("Coding Club Quizzes");

      if (!folders.hasNext()) {
        Logger.log("Folder not found.");
        continue;
      }

      var folder = folders.next();
      var files = folder.getFiles();

      while (files.hasNext()) {

        var file = files.next();

        try {

          var form = FormApp.openById(file.getId());

          if (
            form.getTitle().indexOf(subject) != -1 &&
            form.getTitle().indexOf(topic) != -1
          ) {

            var responses = form.getResponses();

            responseCount = responses.length;

            responses.forEach(function(response){

              var items = response.getItemResponses();

              items.forEach(function(item){

                if(item.getItem().getTitle() == "Full Name"){
                  studentNames.push(item.getResponse());
                }

              });

            });

            break;
          }

        } catch(err){
          // Ignore non-form files
        }

      }

      reportSheet.appendRow([
        quizDate,
        subject,
        topic,
        responseCount,
        studentNames.join(", "),
        quizLink
      ]);

    } catch(e){

      Logger.log("Error on row " + i + ": " + e);

    }

  }

  reportSheet.autoResizeColumns(1,6);

  Logger.log("✅ Weekly report generated successfully!");

}
