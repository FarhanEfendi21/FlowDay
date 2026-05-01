# Requirements Document: Search Tasks & Habits

## Feature Overview

Add real-time search functionality to Tasks and Habits pages in FlowDay, allowing users to quickly filter items by title and description (tasks) or title (habits). Search works alongside existing filters and in both active and trash views.

## Acceptance Criteria

### 1. Tasks Page Search Input

**Requirement**: A search input field must be added to the Tasks page filter section.

**Acceptance Criteria**:
- [ ] Search input is visible in the filter section on Tasks page
- [ ] Search input is positioned before or alongside subject/status dropdowns
- [ ] Search input has placeholder text "Cari..." or similar
- [ ] Search input accepts text input from user
- [ ] Search input is responsive (full width on mobile, ~200px on desktop)
- [ ] Search input is disabled during loading state

**Testable As**: Example (UI verification)

---

### 2. Tasks Search Functionality

**Requirement**: Search must filter tasks by title and description in real-time.

**Acceptance Criteria**:
- [ ] Typing in search input immediately filters displayed tasks
- [ ] Search matches against task title field
- [ ] Search matches against task description field
- [ ] Search is case-insensitive (e.g., "math" matches "Math")
- [ ] Search uses partial string matching (e.g., "work" matches "homework")
- [ ] Empty search query displays all tasks (matching other filters)
- [ ] Whitespace-only search query displays all tasks (matching other filters)
- [ ] Tasks with null descriptions are searchable by title only

**Testable As**: Property (search matching behavior)

---

### 3. Tasks Search with Existing Filters

**Requirement**: Search must work in combination with existing subject and status filters.

**Acceptance Criteria**:
- [ ] Search results are subset of current subject filter
- [ ] Search results are subset of current status filter
- [ ] Search results are subset of both subject AND status filters
- [ ] Changing subject filter updates search results
- [ ] Changing status filter updates search results
- [ ] All three filters (search, subject, status) work together with AND logic

**Testable As**: Property (filter combination)

---

### 4. Tasks Search in Active View

**Requirement**: Search must filter tasks in the active (non-trash) view.

**Acceptance Criteria**:
- [ ] Search filters "To Do" section tasks
- [ ] Search filters "Done" section tasks
- [ ] Search results maintain sort order (To Do first, then Done)
- [ ] Search results maintain due date sort within each section
- [ ] Empty state displays when search returns no results

**Testable As**: Example (search in active view)

---

### 5. Tasks Search in Trash View

**Requirement**: Search must filter deleted tasks in the trash view.

**Acceptance Criteria**:
- [ ] Search input is visible in trash view
- [ ] Search filters only deleted tasks
- [ ] Search does not show active tasks when in trash view
- [ ] Switching from active to trash view updates search results
- [ ] Switching from trash to active view updates search results

**Testable As**: Example (search in trash view)

---

### 6. Habits Page Search Input

**Requirement**: A search input field must be added to the Habits page.

**Acceptance Criteria**:
- [ ] Search input is visible on Habits page
- [ ] Search input is positioned in filter section (above tracker or in header area)
- [ ] Search input has placeholder text "Cari..." or similar
- [ ] Search input accepts text input from user
- [ ] Search input is responsive (full width on mobile, ~200px on desktop)
- [ ] Search input is disabled during loading state

**Testable As**: Example (UI verification)

---

### 7. Habits Search Functionality

**Requirement**: Search must filter habits by title in real-time.

**Acceptance Criteria**:
- [ ] Typing in search input immediately filters displayed habits
- [ ] Search matches against habit title field
- [ ] Search is case-insensitive (e.g., "morning" matches "Morning")
- [ ] Search uses partial string matching (e.g., "read" matches "reading")
- [ ] Empty search query displays all habits
- [ ] Whitespace-only search query displays all habits

**Testable As**: Property (search matching behavior)

---

### 8. Habits Search in Active View

**Requirement**: Search must filter habits in the active (non-trash) view.

**Acceptance Criteria**:
- [ ] Search filters habits in weekly tracker
- [ ] Search filters habits in habit cards section
- [ ] Search results maintain original habit order
- [ ] Empty state displays when search returns no results
- [ ] Stats cards (Total Streak, Completed Today, Total Habit) update based on filtered results

**Testable As**: Example (search in active view)

---

### 9. Habits Search in Trash View

**Requirement**: Search must filter deleted habits in the trash view.

**Acceptance Criteria**:
- [ ] Search input is visible in trash view
- [ ] Search filters only deleted habits
- [ ] Search does not show active habits when in trash view
- [ ] Switching from active to trash view updates search results
- [ ] Switching from trash to active view updates search results

**Testable As**: Example (search in trash view)

---

### 10. Search Performance

**Requirement**: Search must provide instant feedback without noticeable lag.

**Acceptance Criteria**:
- [ ] Search results update within 100ms of user input
- [ ] No API calls are made for search (client-side filtering)
- [ ] Page remains responsive while typing
- [ ] No debouncing is needed (instant filtering)

**Testable As**: Edge Case (performance under load)

---

### 11. Empty State Handling

**Requirement**: Display appropriate empty state when search returns no results.

**Acceptance Criteria**:
- [ ] Empty state displays when search query matches no items
- [ ] Empty state message indicates search query (e.g., "No tasks found matching 'xyz'")
- [ ] Search input remains visible in empty state
- [ ] User can modify search or filters to see results

**Testable As**: Example (empty state display)

---

### 12. Search State Management

**Requirement**: Search state must be properly managed across view changes.

**Acceptance Criteria**:
- [ ] Search query persists when changing other filters
- [ ] Search query persists when toggling between active/trash views (optional)
- [ ] Search query is cleared when navigating away from page
- [ ] Search state does not affect other pages

**Testable As**: Example (state persistence)

---

### 13. Accessibility

**Requirement**: Search functionality must be accessible to all users.

**Acceptance Criteria**:
- [ ] Search input has proper label or aria-label
- [ ] Search input is keyboard accessible (Tab, Enter)
- [ ] Search results are announced to screen readers
- [ ] Empty state is announced to screen readers
- [ ] Search input has sufficient color contrast

**Testable As**: Edge Case (accessibility compliance)

---

### 14. Mobile Responsiveness

**Requirement**: Search must work well on mobile devices.

**Acceptance Criteria**:
- [ ] Search input is full width on mobile
- [ ] Search input is easily tappable (minimum 44px height)
- [ ] Keyboard does not obscure search results
- [ ] Search results are readable on small screens
- [ ] Filter section layout adapts to mobile (wraps if needed)

**Testable As**: Example (mobile UI)

---

### 15. No Breaking Changes

**Requirement**: Search feature must not break existing functionality.

**Acceptance Criteria**:
- [ ] Existing filters (subject, status) continue to work
- [ ] Existing sort order is maintained
- [ ] Trash view functionality is unchanged
- [ ] Task/habit creation, editing, deletion unchanged
- [ ] No database schema changes required

**Testable As**: Example (backward compatibility)

---

## Non-Functional Requirements

### Performance
- Search filtering must complete in <100ms for typical user datasets (<1000 items)
- No additional API calls for search (client-side only)
- Memory usage must not increase significantly

### Usability
- Search must be intuitive and discoverable
- Search results must update in real-time
- Empty state must be clear and helpful

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader support

### Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Works on mobile browsers (iOS Safari, Chrome Mobile)
- Works with existing PWA functionality

---

## Scope

### In Scope
- Search input UI component
- Client-side search filtering logic
- Search in Tasks page (active and trash views)
- Search in Habits page (active and trash views)
- Empty state handling
- Responsive design

### Out of Scope
- Server-side search implementation
- Search history or saved searches
- Advanced search syntax (AND, OR, NOT operators)
- Search analytics or logging
- Full-text search index
- Search suggestions or autocomplete

---

## Success Metrics

1. **Functionality**: All 15 acceptance criteria are met
2. **Performance**: Search completes in <100ms
3. **User Satisfaction**: Users can find tasks/habits quickly
4. **Code Quality**: No breaking changes, backward compatible
5. **Test Coverage**: >80% coverage for search logic

---

## Dependencies

### Technical Dependencies
- React (hooks: useState, useMemo)
- React Query (useGetTasks, useGetHabits)
- Existing UI components (Input, Select, Button)

### Data Dependencies
- Task data structure (title, description, subject, status)
- Habit data structure (title)
- Existing filter state (subject, status, showTrash)

### External Dependencies
- None (uses existing libraries)

---

## Assumptions

1. User dataset is <1000 items per user (client-side filtering is sufficient)
2. Search is performed on client-side only (no server-side search needed)
3. Search is case-insensitive (user expectation)
4. Partial string matching is desired (not exact match only)
5. Search combines with existing filters using AND logic
6. No special search syntax is needed (simple substring matching)

---

## Constraints

1. Must not require database schema changes
2. Must not require API changes
3. Must maintain existing sort order
4. Must work in both active and trash views
5. Must be responsive on mobile devices
6. Must not impact performance of other features

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Search performance degrades with large datasets | Low | Medium | Monitor performance, plan server-side search for future |
| Search state conflicts with other filters | Low | Low | Thorough testing of filter combinations |
| Mobile UX issues with search input | Medium | Low | Responsive design testing, mobile user testing |
| Accessibility issues | Medium | Medium | WCAG compliance testing, screen reader testing |
| Breaking existing functionality | Low | High | Comprehensive regression testing |

---

## Timeline and Milestones

### Phase 1: Design & Planning (Complete)
- [x] Create design document
- [x] Create requirements document
- [x] Identify implementation approach

### Phase 2: Implementation
- [ ] Add search state to Tasks page
- [ ] Add search input UI to Tasks page
- [ ] Implement search filtering logic for Tasks
- [ ] Add search state to Habits page
- [ ] Add search input UI to Habits page
- [ ] Implement search filtering logic for Habits
- [ ] Test in active and trash views

### Phase 3: Testing & QA
- [ ] Unit tests for search logic
- [ ] Property-based tests for search behavior
- [ ] Integration tests for search flows
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing
- [ ] Regression testing

### Phase 4: Deployment
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Related Documents

- Design Document: `design.md`
- Task List: `tasks.md`
- Implementation Guide: (to be created)

---

## Approval and Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | - | - | - |
| Tech Lead | - | - | - |
| QA Lead | - | - | - |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Design-First Workflow | Initial requirements document |

