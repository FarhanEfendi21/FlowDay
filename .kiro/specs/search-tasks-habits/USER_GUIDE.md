# Search Feature - User Guide

## 🔍 How to Use Search

### Tasks Page

#### Finding Tasks
1. Go to the **Tasks** page
2. Look for the search input field at the top (says "Cari...")
3. Type what you're looking for:
   - Search by task title (e.g., "math", "homework")
   - Search by task description (e.g., "chapter 5", "due friday")
4. Results update instantly as you type

#### Search Examples

| What You Type | What It Finds |
|---|---|
| "math" | Tasks with "math" in title or description |
| "homework" | Tasks with "homework" in title or description |
| "chapter" | Tasks with "chapter" in title or description |
| "due" | Tasks with "due" in title or description |

#### Combining Search with Filters
You can use search together with other filters:

1. **Search + Subject Filter**
   - Select "Math" from subject dropdown
   - Type "homework" in search
   - Result: Only Math tasks with "homework"

2. **Search + Status Filter**
   - Select "To Do" from status dropdown
   - Type "urgent" in search
   - Result: Only pending tasks with "urgent"

3. **Search + Both Filters**
   - Select "Math" from subject dropdown
   - Select "To Do" from status dropdown
   - Type "homework" in search
   - Result: Only pending Math tasks with "homework"

#### Searching in Trash
1. Click "Lihat Trash (X)" button to view deleted tasks
2. Use the search input to find deleted tasks
3. Click "Lihat Tasks" to go back to active tasks

#### Tips
- ✅ Search is **case-insensitive** (e.g., "Math" = "math" = "MATH")
- ✅ Search finds **partial matches** (e.g., "work" finds "homework")
- ✅ Search is **real-time** (results update as you type)
- ✅ Clear search to see all tasks again

---

### Habits Page

#### Finding Habits
1. Go to the **Habits** page
2. Look for the search input field below the header
3. Type what you're looking for:
   - Search by habit name (e.g., "reading", "exercise")
4. Results update instantly as you type

#### Search Examples

| What You Type | What It Finds |
|---|---|
| "read" | Habits with "read" in name (e.g., "reading", "read book") |
| "exercise" | Habits with "exercise" in name |
| "morning" | Habits with "morning" in name (e.g., "morning run") |
| "study" | Habits with "study" in name |

#### What Updates When You Search
When you search on the Habits page, these things update:
- ✅ Weekly tracker shows only matching habits
- ✅ Habit cards show only matching habits
- ✅ Stats cards update:
  - Total Streak: Sum of matching habits' streaks
  - Completed Today: Count of matching habits completed today
  - Total Habit: Count of matching habits

#### Searching in Trash
1. Click "Lihat Trash (X)" button to view deleted habits
2. Use the search input to find deleted habits
3. Click "Lihat Habits" to go back to active habits

#### Tips
- ✅ Search is **case-insensitive** (e.g., "Morning" = "morning")
- ✅ Search finds **partial matches** (e.g., "read" finds "reading")
- ✅ Search is **real-time** (results update as you type)
- ✅ Clear search to see all habits again

---

## 🎯 Common Use Cases

### Use Case 1: Find a Specific Task
**Scenario**: You remember the task is about "calculus" but can't find it

**Solution**:
1. Go to Tasks page
2. Type "calculus" in search
3. All tasks with "calculus" appear

### Use Case 2: Find All Math Homework
**Scenario**: You want to see all pending Math homework

**Solution**:
1. Go to Tasks page
2. Select "Math" from subject dropdown
3. Select "To Do" from status dropdown
4. Type "homework" in search
5. Only pending Math homework appears

### Use Case 3: Find Completed Tasks
**Scenario**: You want to see what you completed today

**Solution**:
1. Go to Tasks page
2. Select "Selesai" (Done) from status dropdown
3. All completed tasks appear
4. Optionally type in search to narrow down

### Use Case 4: Find a Habit by Name
**Scenario**: You have many habits and want to find "morning run"

**Solution**:
1. Go to Habits page
2. Type "morning" in search
3. All habits with "morning" appear

### Use Case 5: Check Deleted Items
**Scenario**: You accidentally deleted a task and want to restore it

**Solution**:
1. Go to Tasks or Habits page
2. Click "Lihat Trash" button
3. Type in search to find the deleted item
4. Click the menu and select "Kembalikan" (Restore)

---

## ❓ FAQ

### Q: Is search case-sensitive?
**A**: No! Search is case-insensitive. "Math", "math", and "MATH" all find the same results.

### Q: Does search find partial matches?
**A**: Yes! Search finds partial matches. For example, "work" will find "homework", "coursework", and "network".

### Q: Can I search in trash?
**A**: Yes! When you're viewing trash, the search input is still available and will search only deleted items.

### Q: Does search work with other filters?
**A**: Yes! Search works together with subject and status filters. All filters combine using AND logic (all must match).

### Q: What happens if I clear the search?
**A**: All items matching other filters will appear again.

### Q: Is search real-time?
**A**: Yes! Results update instantly as you type. No need to press Enter or click a button.

### Q: Does search make API calls?
**A**: No! Search is performed locally in your browser. It's instant and works offline.

### Q: Can I search by description on Habits?
**A**: No, habits don't have descriptions. You can only search by habit name/title.

### Q: What if no results match my search?
**A**: An empty state message will appear saying "Tidak ada hasil" (No results) with your search query.

### Q: Does search affect my data?
**A**: No! Search only filters what you see. Your data is never modified.

---

## 🎨 Visual Guide

### Tasks Page Search

```
┌─────────────────────────────────────────────────────────┐
│ Tasks                                                   │
│ Kelola tugas kuliah dan deadline kamu                   │
├─────────────────────────────────────────────────────────┤
│ [Cari...] [Mata Kuliah ▼] [Status ▼]                   │
│  ↑                                                      │
│  Type here to search                                    │
├─────────────────────────────────────────────────────────┤
│ To Do (3)                                               │
│ ├─ Math homework - Chapter 5                           │
│ ├─ Physics project - Due Friday                        │
│ └─ Chemistry lab - Report                              │
│                                                         │
│ Done (2)                                                │
│ ├─ English essay - Submitted                           │
│ └─ History presentation - Completed                    │
└─────────────────────────────────────────────────────────┘
```

### Habits Page Search

```
┌─────────────────────────────────────────────────────────┐
│ Habits                                                  │
│ Bangun kebiasaan produktif dan pantau streakmu         │
├─────────────────────────────────────────────────────────┤
│ [Cari...]                                               │
│  ↑                                                      │
│  Type here to search                                    │
├─────────────────────────────────────────────────────────┤
│ Total Streak: 15 | Selesai: 2/5 | Total: 5            │
├─────────────────────────────────────────────────────────┤
│ Tracker Mingguan                                        │
│ ├─ Morning Run: [✓] [✓] [ ] [✓] [✓] [ ] [✓]          │
│ ├─ Reading: [✓] [ ] [✓] [ ] [✓] [✓] [ ]              │
│ └─ Meditation: [ ] [✓] [✓] [✓] [ ] [✓] [✓]           │
├─────────────────────────────────────────────────────────┤
│ Habit Cards                                             │
│ ├─ Morning Run (7 day streak)                          │
│ ├─ Reading (5 day streak)                              │
│ └─ Meditation (6 day streak)                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Tips & Tricks

### Tip 1: Use Partial Searches
Instead of typing the full name, you can type just part of it:
- Type "math" instead of "mathematics"
- Type "read" instead of "reading"
- Type "run" instead of "morning run"

### Tip 2: Combine Filters for Precision
Use search with other filters to narrow down results:
- Subject + Search: Find tasks in a specific subject
- Status + Search: Find tasks with a specific status
- Both + Search: Find tasks matching all criteria

### Tip 3: Search in Trash to Recover Items
If you accidentally deleted something:
1. Go to Trash view
2. Search for the item
3. Restore it from the menu

### Tip 4: Clear Search to Reset
If you want to see all items again, just clear the search input.

### Tip 4: Use Search with Status Filter
To see only completed tasks:
1. Select "Selesai" (Done) from status dropdown
2. Optionally type in search to narrow down further

---

## 📱 Mobile Tips

### On Mobile Devices
- Search input is full width for easy typing
- Tap the search input to focus it
- Use your keyboard to type
- Results update as you type
- Swipe to see more results if needed

### Mobile Keyboard
- Tap the search input to open keyboard
- Type your search query
- Tap outside to close keyboard
- Results stay visible while keyboard is open

---

## ⚡ Performance

### Search Speed
- Search results appear **instantly** as you type
- No waiting for API calls
- Works even with slow internet
- Works offline (PWA feature)

### Large Datasets
- Search works smoothly with hundreds of tasks/habits
- No lag or slowdown
- Optimized for performance

---

## 🔒 Privacy & Security

### Your Data is Safe
- Search is performed locally in your browser
- No search queries are sent to servers
- No tracking of search terms
- Your data is never modified by search

### Offline Search
- Search works even without internet
- Perfect for PWA (Progressive Web App)
- All data is stored locally

---

## 🆘 Troubleshooting

### Problem: Search not working
**Solution**: 
- Refresh the page
- Check if search input is focused
- Try clearing and re-typing

### Problem: No results found
**Solution**:
- Check spelling of search term
- Try partial search (e.g., "work" instead of "homework")
- Clear other filters to see all items
- Check if item is in trash

### Problem: Search is slow
**Solution**:
- This shouldn't happen! Search is instant
- Try refreshing the page
- Check your internet connection

### Problem: Can't find deleted item
**Solution**:
- Go to Trash view
- Use search to find the deleted item
- Restore it from the menu

---

## 📞 Need Help?

If you have questions about search:
1. Check this guide
2. Try the examples above
3. Contact support

---

**Last Updated**: April 26, 2026  
**Version**: 1.0  
**Status**: ✅ Complete
