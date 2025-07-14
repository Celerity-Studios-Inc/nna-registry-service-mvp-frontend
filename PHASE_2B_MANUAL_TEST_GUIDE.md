# Phase 2B Manual Test Guide

**Date**: July 14, 2025  
**Environment**: Development Branch - localhost:3000 → localhost:8080  
**Status**: ✅ **READY FOR MANUAL TESTING**  

## 🧪 **Test Plan A: Stars Layer (S) Asset Creation**

### **Quick Test Setup**
1. **✅ Frontend**: http://localhost:3000 (running)
2. **✅ Backend**: http://localhost:8080 (Phase 2B ready)
3. **✅ Branch**: development (safe testing)
4. **✅ Phase 2B Integration**: All new fields implemented

## 📋 **Manual Testing Steps**

### **Step 1: Navigate to Registration**
```
1. Open browser to http://localhost:3000
2. Click "Register Asset" or navigate to registration page
3. Verify form loads correctly
```

### **Step 2: Select Stars Layer (S)**
```
1. Select Layer: S (Stars)
2. Verify taxonomy options appear
3. Check that Stars-specific guidance appears
```

### **Step 3: Choose Pop Category and Base Subcategory**
```
1. Category: Pop
2. Subcategory: Base (or equivalent)
3. Verify taxonomy completes successfully
```

### **Step 4: Upload Test Image**
```
1. Upload any image file (JPG, PNG)
2. Verify file upload completes
3. Check preview appears
```

### **Step 5: Enter Creator's Description**
```
1. Find "Creator's Description" field
2. Enter exactly: "Kelly performing on stage with dynamic lighting"
3. Verify field accepts input (character count should work)
```

### **Step 6: AI Generation (if available)**
```
1. Look for AI generation button/trigger
2. Click to generate AI metadata
3. Verify AI processes the input
4. Check AI content appears in form
```

### **Step 7: Submit Asset**
```
1. Click Submit/Create Asset button
2. Watch for submission to localhost:8080
3. Verify successful creation message
```

### **Step 8: Verify Success Page**
```
1. Check success page displays
2. Verify Creator's Description shows: "Kelly performing on stage with dynamic lighting"
3. Check AI-generated content displays
4. Verify all new Phase 2B fields are present
```

### **Step 9: Asset Details Page**
```
1. Navigate to asset details page
2. Verify Creator's Description displays correctly
3. Check AI metadata section appears
4. Verify all new Phase 2B fields display properly
```

### **Step 10: Search Integration**
```
1. Go to search/browse page
2. Search for "Kelly performing"
3. Verify asset appears in results
4. Check search works with new fields
```

## 🔍 **What to Look For**

### **Critical Success Indicators**
- **✅ Creator's Description Preservation**: Exact text "Kelly performing on stage with dynamic lighting"
- **✅ AI Metadata Display**: Structured AI content in dedicated section
- **✅ Backend Integration**: Form submits to localhost:8080 successfully
- **✅ UI Integration**: All new fields display correctly
- **✅ Search Integration**: New fields are searchable

### **Phase 2B Fields to Verify**
```javascript
// Backend Response should contain:
{
  "creatorDescription": "Kelly performing on stage with dynamic lighting",
  "aiMetadata": {
    "generatedDescription": "...",
    "mood": "...",
    "genre": "...",
    "tags": [...]
  },
  "albumArt": "..." // if applicable
}
```

### **Browser Console Checks**
```javascript
// Look for these in browser console:
- "🎯 PHASE 2B TESTING backend URL for DEVELOPMENT: http://localhost:8080"
- Asset creation requests going to localhost:8080
- Successful API responses with new fields
- No 404 or 500 errors
```

## 🚨 **Common Issues to Watch For**

### **Backend Connection Issues**
- **Problem**: Requests still going to registry.dev.reviz.dev
- **Solution**: Verify environment.config.ts change is active
- **Check**: Browser console should show localhost:8080 URLs

### **Field Mapping Issues**
- **Problem**: Creator's Description not preserved
- **Solution**: Check backend response contains `creatorDescription` field
- **Check**: Success page should show exact input text

### **UI Display Issues**
- **Problem**: New fields don't appear in asset details
- **Solution**: Check asset detail page code for new field display
- **Check**: AI metadata section should be visible

### **Search Issues**
- **Problem**: Search doesn't find assets with new fields
- **Solution**: Verify backend search index includes new fields
- **Check**: Search for "Kelly performing" should find the test asset

## 📊 **Test Results Checklist**

### **High Priority (Must Pass)**
- [ ] Asset creation completes successfully
- [ ] Creator's Description preserved exactly: "Kelly performing on stage with dynamic lighting"
- [ ] AI metadata generated and displayed
- [ ] Backend integration working (localhost:8080)
- [ ] UI displays all new fields correctly
- [ ] Search finds asset with new fields

### **Medium Priority (Should Pass)**
- [ ] Form validation works with new fields
- [ ] Success page layout correct
- [ ] Asset details page enhanced
- [ ] No JavaScript errors in console
- [ ] Performance acceptable

### **Low Priority (Nice to Have)**
- [ ] Error handling for new fields
- [ ] Edge cases work correctly
- [ ] Responsive design maintained

## 🎯 **Expected Results**

### **Successful Test Completion**
If all steps pass, you should see:
1. **Asset Created**: Successfully in Stars layer
2. **Creator's Description**: Exactly preserved as entered
3. **AI Metadata**: Properly structured and displayed
4. **Backend Integration**: Working with localhost:8080
5. **UI Integration**: All new fields displaying correctly
6. **Search Integration**: New fields searchable

### **Success Criteria Met**
- ✅ **Phase 2B Backend**: Successfully integrated
- ✅ **New Fields**: All working correctly
- ✅ **UI Enhancement**: Properly implemented
- ✅ **Backwards Compatibility**: Preserved

---

## 📞 **Reporting Results**

Please report back with:
1. **Overall Success**: Did the test pass?
2. **Specific Issues**: Any problems encountered?
3. **Backend Integration**: Did requests go to localhost:8080?
4. **Field Preservation**: Was Creator's Description preserved exactly?
5. **UI Display**: Did all new fields display correctly?

**Test Environment**: ✅ **READY**  
**Phase 2B Backend**: ✅ **RUNNING**  
**Frontend Integration**: ✅ **COMPLETE**  

**Ready for manual testing execution!**