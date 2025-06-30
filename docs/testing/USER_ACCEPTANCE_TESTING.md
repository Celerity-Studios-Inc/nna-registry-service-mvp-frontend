# User Acceptance Testing - NNA Registry Service

## Overview
This document provides a comprehensive testing framework for validating the NNA Registry Service from an end-user perspective.

## 🎯 **Test Scenarios**

### **Scenario 1: Component Asset Registration**
**Objective**: Register a single component asset (G, S, L, M, W layer)

**Test Steps**:
1. Navigate to Register Asset page
2. Double-click on Stars (S) layer
3. Select category: "Pop" 
4. Select subcategory: "Idol" (IDF)
5. Upload a PNG image file (2-5MB)
6. Fill in name: "Test Star Asset"
7. Fill in description: "User acceptance test asset"
8. Select source: "ReViz"
9. Add tags: "test", "user-acceptance"
10. Click Submit

**Expected Results**:
- ✅ Layer selection advances to taxonomy step
- ✅ Taxonomy selection shows available categories
- ✅ File upload shows preview and progress
- ✅ Form validation works correctly
- ✅ Success page shows proper HFN: `S.POP.IDF.XXX`
- ✅ Success page shows proper MFA: `2.001.003.XXX`

### **Scenario 2: Large File Upload (Video)**
**Objective**: Test smart routing with large video file

**Test Steps**:
1. Register Asset → Moves (M) layer
2. Select category: "Pop", subcategory: "Vogue" (VOG)
3. Upload MP4 video file (10-25MB)
4. Complete registration form
5. Submit asset

**Expected Results**:
- ✅ Console shows: "📤 Uploading asset via DIRECT backend"
- ✅ Console shows: "✅ Using direct backend for large file upload"
- ✅ Upload completes successfully
- ✅ Video thumbnail generates on success page
- ✅ Asset appears in browse results

### **Scenario 3: Composite Asset Creation**
**Objective**: Create a composite asset with multiple components

**Test Steps**:
1. Register Asset → Composites (C) layer
2. Select category: "ReMix", subcategory: "Pop" (POP)
3. Upload video file for composite
4. Complete Steps 1-4 (same as component asset)
5. **Step 5: Search & Add Components**
   - Search for existing Stars assets
   - Select 1-2 Star components
   - Search for existing Moves assets
   - Select 1-2 Move components
   - Verify component selection shows count
6. Submit composite asset

**Expected Results**:
- ✅ 5-step workflow completes correctly
- ✅ Component search finds existing assets
- ✅ Component selection preserves choices
- ✅ Success page shows composite HFN: `C.RMX.POP.XXX:S.XXX.XXX.XXX+M.XXX.XXX.XXX`
- ✅ Composite asset appears in browse results

### **Scenario 4: Search & Browse Functionality**
**Objective**: Validate search and filtering capabilities

**Test Steps**:
1. Navigate to Browse Assets
2. **Layer Filtering**:
   - Select "Stars" layer filter
   - Verify only Star assets appear
3. **Category Filtering**:
   - With Stars selected, choose "Pop" category
   - Verify results narrow correctly
4. **Text Search**:
   - Enter search term: "test"
   - Verify search results include your test assets
5. **Sort Testing**:
   - Sort by "Layer" → should see alphabetical order
   - Change Order to "Z → A" → should reverse order
   - Sort by "Date" → should show newest first
   - Change Order to "Oldest First" → should reverse

**Expected Results**:
- ✅ Layer filtering works correctly
- ✅ Category filtering narrows results appropriately
- ✅ Text search finds relevant assets
- ✅ Sort by Layer shows: B → C → G → L → M → P → R → S → T → W
- ✅ Order dropdown triggers immediate re-sort
- ✅ All sort combinations work correctly

### **Scenario 5: Asset Details & Video Thumbnails**
**Objective**: Verify asset detail pages and video preview

**Test Steps**:
1. From Browse Assets, click on a video asset card
2. Verify asset detail page loads
3. Check video thumbnail generation
4. Verify all metadata displays correctly
5. Test navigation back to browse

**Expected Results**:
- ✅ Asset detail page loads without errors
- ✅ Video thumbnail displays (or layer icon fallback)
- ✅ HFN and MFA display correctly
- ✅ All metadata fields populated
- ✅ Back navigation works correctly

### **Scenario 6: Settings Configuration**
**Objective**: Test user settings and date filtering

**Test Steps**:
1. Navigate to Settings page
2. Modify "Hide assets before date" setting
3. Set date to current date minus 1 week
4. Save settings
5. Return to Browse Assets
6. Verify older assets are filtered out

**Expected Results**:
- ✅ Settings page loads correctly
- ✅ Date picker works properly
- ✅ Settings save successfully
- ✅ Browse Assets respects date filtering
- ✅ Asset count reflects filtering

## 🔍 **Edge Case Testing**

### **File Size Edge Cases**
- **3.9MB file**: Should use proxy route
- **4.1MB file**: Should use direct backend route
- **30MB+ file**: Should use direct backend successfully
- **35MB+ file**: Should show validation error

### **Network Conditions**
- **Slow connection**: Upload progress should display
- **Connection interruption**: Proper error handling
- **CORS errors**: Should not occur with current backend config

### **Browser Compatibility**
- **Chrome**: Full functionality expected
- **Firefox**: Full functionality expected
- **Safari**: Video thumbnails may have different behavior
- **Mobile browsers**: Responsive design validation

## 📝 **Test Report Template**

### **Test Session Information**
- **Date**: ___________
- **Tester**: ___________
- **Browser**: ___________
- **Environment**: Production / Staging

### **Results Summary**
| Scenario | Status | Notes |
|----------|---------|-------|
| Component Asset Registration | ✅❌ | |
| Large File Upload | ✅❌ | |
| Composite Asset Creation | ✅❌ | |
| Search & Browse | ✅❌ | |
| Asset Details | ✅❌ | |
| Settings Configuration | ✅❌ | |

### **Issues Found**
| Issue | Severity | Description | Workaround |
|-------|----------|-------------|------------|
| | High/Medium/Low | | |

### **Performance Observations**
- **Page Load Times**: ___________
- **Upload Speeds**: ___________
- **Search Response**: ___________
- **Video Thumbnail Generation**: ___________

## 🎯 **Acceptance Criteria**

### **Must Pass (Critical)**
- ✅ All asset registration workflows complete successfully
- ✅ File uploads work for all sizes up to 32MB
- ✅ Search and browse functionality operates correctly
- ✅ Sort functionality works for all options
- ✅ Video thumbnails generate or show appropriate fallbacks
- ✅ Settings persist and apply correctly

### **Should Pass (Important)**
- ✅ Upload performance meets expectations (<15 seconds for large files)
- ✅ Search response times are acceptable (<1 second)
- ✅ UI is responsive and professional
- ✅ Error messages are clear and helpful

### **Nice to Have (Enhancement)**
- ✅ Video thumbnails generate quickly
- ✅ Advanced search features work intuitively
- ✅ Mobile experience is optimal

## 🚀 **Sign-off Criteria**

**System is ready for production launch when**:
- [ ] All "Must Pass" criteria are met
- [ ] 90%+ of "Should Pass" criteria are met
- [ ] No critical bugs discovered
- [ ] Performance meets benchmarks
- [ ] User experience is professional and intuitive

**Recommended Test Duration**: 2-4 hours comprehensive testing
**Recommended Testers**: 2-3 users (technical and non-technical)

---

**Testing Framework Version**: 1.0  
**Last Updated**: January 2025  
**Compatible With**: MVP Release 1.0.1+