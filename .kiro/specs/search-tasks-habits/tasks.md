# Task List: Search Tasks & Habits

## Phase 1: Tasks Page Search Implementation

### 1.1 Add Search State to Tasks Page
- [x] Add `searchQuery` state variable initialized to empty string
- [x] Add `setSearchQuery` setter function
- [x] Verify state updates on input change

**Acceptance**: State variable exists and updates correctly ✅

---

### 1.2 Create Search Input Component
- [x] Create SearchInput component or use existing Input component
- [x] Add search input to filter section (before or alongside subject/status dropdowns)
- [x] Set placeholder text to "Cari..."
- [x] Connect input to `searchQuery` state
- [x] Make input responsive (full width on mobile, ~200px on desktop)

**Acceptance**: Search input renders and accepts user input ✅

---

### 1.3 Update filteredTasks useMemo
- [x] Add search filter logic to existing useMemo
- [x] Implement case-insensitive substring matching
- [x] Search both title and description fields
- [x] Handle null descriptions gracefully
- [x] Add `searchQuery` to dependency array

**Acceptance**: Search filtering works correctly with existing filters ✅

---

### 1.4 Test Tasks Page Search - Active View
- [x] Test search filters tasks by title
- [x] Test search filters tasks by description
- [x] Test case-insensitive matching
- [x] Test partial string matching
- [x] Test empty search returns all tasks
- [x] Test whitespace-only search returns all tasks
- [x] Test search combines with subject filter
- [x] Test search combines with status filter
- [x] Test search combines with both filters

**Acceptance**: All search tests pass in active view ✅

---

### 1.5 Test Tasks Page Search - Trash View
- [x] Test search filters deleted tasks only
- [x] Test search does not show active tasks in trash
- [x] Test switching from active to trash updates results
- [x] Test switching from trash to active updates results
- [x] Test empty state displays when no results

**Acceptance**: Search works correctly in trash view ✅

---

## Phase 2: Habits Page Search Implementation

### 2.1 Add Search State to Habits Page
- [x] Add `searchQuery` state variable initialized to empty string
- [x] Add `setSearchQuery` setter function
- [x] Verify state updates on input change

**Acceptance**: State variable exists and updates correctly ✅

---

### 2.2 Add Search Input to Habits Page
- [x] Add search input to Habits page (above tracker or in header area)
- [x] Set placeholder text to "Cari..."
- [x] Connect input to `searchQuery` state
- [x] Make input responsive (full width on mobile, ~200px on desktop)
- [x] Ensure input is visible in both active and trash views

**Acceptance**: Search input renders and accepts user input ✅

---

### 2.3 Implement Habits Search Filtering
- [x] Create filtering logic for active habits
- [x] Implement case-insensitive substring matching
- [x] Search title field only
- [x] Handle empty search query
- [x] Create filtering logic for deleted habits
- [x] Ensure search works in both views

**Acceptance**: Search filtering works correctly for habits ✅

---

### 2.4 Update Habits Display with Search
- [x] Filter habits in weekly tracker based on search
- [x] Filter habits in habit cards based on search
- [x] Update stats cards to reflect filtered habits
- [x] Display empty state when no results

**Acceptance**: All habit components update based on search ✅

---

### 2.5 Test Habits Page Search - Active View
- [x] Test search filters habits by title
- [x] Test case-insensitive matching
- [x] Test partial string matching
- [x] Test empty search returns all habits
- [x] Test whitespace-only search returns all habits
- [x] Test weekly tracker updates with search
- [x] Test habit cards update with search
- [x] Test stats cards update with search

**Acceptance**: All search tests pass in active view ✅

---

### 2.6 Test Habits Page Search - Trash View
- [x] Test search filters deleted habits only
- [x] Test search does not show active habits in trash
- [x] Test switching from active to trash updates results
- [x] Test switching from trash to active updates results
- [x] Test empty state displays when no results

**Acceptance**: Search works correctly in trash view ✅

---

## Phase 3: Integration and Cross-Feature Testing

### 3.1 Test Search Performance
- [ ] Measure search filtering time (<100ms target)
- [ ] Test with typical dataset size (~100-500 items)
- [ ] Test with large dataset size (~1000 items)
- [ ] Verify no API calls are made for search
- [ ] Verify page remains responsive while typing

**Acceptance**: Search performance meets requirements

---

### 3.2 Test Search State Management
- [ ] Test search persists when changing other filters
- [ ] Test search persists when toggling active/trash views
- [ ] Test search clears when navigating away from page
- [ ] Test search state does not affect other pages

**Acceptance**: State management works correctly

---

### 3.3 Test Empty State Handling
- [ ] Test empty state displays when search returns no results
- [ ] Test empty state message includes search query
- [ ] Test search input remains visible in empty state
- [ ] Test user can modify search to see results

**Acceptance**: Empty state handling works correctly

---

### 3.4 Test Backward Compatibility
- [ ] Test existing filters still work without search
- [ ] Test sort order is maintained
- [ ] Test trash view functionality unchanged
- [ ] Test task/habit creation unchanged
- [ ] Test task/habit editing unchanged
- [ ] Test task/habit deletion unchanged

**Acceptance**: No breaking changes to existing functionality

---

### 3.5 Test Mobile Responsiveness
- [ ] Test search input is full width on mobile
- [ ] Test search input is easily tappable (44px+ height)
- [ ] Test keyboard does not obscure search results
- [ ] Test search results are readable on small screens
- [ ] Test filter section layout adapts to mobile

**Acceptance**: Mobile responsiveness meets requirements

---

### 3.6 Test Accessibility
- [ ] Test search input has proper label/aria-label
- [ ] Test search input is keyboard accessible (Tab, Enter)
- [ ] Test search results are announced to screen readers
- [ ] Test empty state is announced to screen readers
- [ ] Test search input has sufficient color contrast

**Acceptance**: Accessibility requirements met

---

## Phase 4: Code Quality and Documentation

### 4.1 Code Review
- [ ] Review Tasks page search implementation
- [ ] Review Habits page search implementation
- [ ] Review search filtering logic
- [ ] Review state management
- [ ] Verify code follows project conventions

**Acceptance**: Code review approved

---

### 4.2 Add Unit Tests
- [ ] Write tests for search filtering logic (Tasks)
- [ ] Write tests for search filtering logic (Habits)
- [ ] Write tests for case-insensitive matching
- [ ] Write tests for partial string matching
- [ ] Write tests for null description handling
- [ ] Write tests for empty search query
- [ ] Write tests for filter combination

**Acceptance**: Unit tests written and passing (>80% coverage)

---

### 4.3 Add Property-Based Tests
- [ ] Write property test for commutativity of filters
- [ ] Write property test for idempotence of search
- [ ] Write property test for case normalization
- [ ] Write property test for subset property

**Acceptance**: Property-based tests written and passing

---

### 4.4 Add Integration Tests
- [ ] Write integration test for Tasks page search flow
- [ ] Write integration test for Habits page search flow
- [ ] Write integration test for trash view search
- [ ] Write integration test for filter combination

**Acceptance**: Integration tests written and passing

---

### 4.5 Update Documentation
- [ ] Update component documentation
- [ ] Add search feature to README
- [ ] Document search behavior and limitations
- [ ] Add examples of search usage

**Acceptance**: Documentation updated

---

## Phase 5: Deployment and Monitoring

### 5.1 Prepare for Deployment
- [ ] Ensure all tests pass
- [ ] Ensure no console errors or warnings
- [ ] Ensure no performance regressions
- [ ] Create deployment checklist

**Acceptance**: Ready for deployment

---

### 5.2 Deploy to Staging
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify search functionality in staging
- [ ] Get stakeholder approval

**Acceptance**: Staging deployment successful

---

### 5.3 Deploy to Production
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Monitor performance metrics
- [ ] Verify search functionality in production

**Acceptance**: Production deployment successful

---

### 5.4 Post-Deployment Monitoring
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Address any issues

**Acceptance**: No critical issues in production

---

## Summary

**Total Tasks**: 30+
**Estimated Effort**: 2-3 days for experienced developer
**Risk Level**: Low (no database changes, backward compatible)
**Priority**: Medium (nice-to-have feature, improves UX)

### Task Breakdown by Phase
- Phase 1 (Tasks Page): 5 tasks
- Phase 2 (Habits Page): 6 tasks
- Phase 3 (Integration): 6 tasks
- Phase 4 (Quality): 5 tasks
- Phase 5 (Deployment): 4 tasks

### Dependencies
- All phases depend on design and requirements being finalized
- Phase 2 can start in parallel with Phase 1
- Phase 3 depends on Phases 1 and 2 being complete
- Phase 4 can start after Phase 3
- Phase 5 depends on Phase 4 being complete

