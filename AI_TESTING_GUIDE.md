# AI Metadata Generation Testing Guide

## Overview
This guide outlines how to test the AI-powered metadata generation feature in the development environment.

## Setup Requirements

### Environment Variables
The following environment variable must be configured in Vercel:
- `REACT_APP_OPENAI_API_KEY`: OpenAI API key for GPT-4o access

### Testing Environment
- **Environment**: Development only
- **URL**: https://nna-registry-frontend-dev.vercel.app
- **Backend**: https://registry.dev.reviz.dev
- **GCS Bucket**: `nna_registry_assets_dev`

## How to Test

### 1. Access AI Feature
1. Navigate to **Register Asset** in development
2. Complete **Steps 1-2** (Select Layer, Choose Taxonomy)
3. In **Step 3**, upload a file
4. **AI Metadata Generation** section should appear below file upload

### 2. Test Different Layers

#### G Layer (Songs) - Audio Files
- **Test File**: Upload .mp3 or .wav file
- **Expected**: AI analyzes audio and generates music-focused metadata
- **Generated Tags**: Genre, tempo, energy, instrumentation, vocal characteristics

#### S Layer (Stars) - Performer Images
- **Test File**: Upload image of performer/avatar
- **Expected**: AI analyzes image and generates performer-focused metadata
- **Generated Tags**: Style, energy, clothing, expression, performance type

#### L Layer (Looks) - Costume/Styling Images
- **Test File**: Upload image of costume/styling
- **Expected**: AI analyzes image and generates fashion-focused metadata
- **Generated Tags**: Style, era, color scheme, formality, cultural influences

#### M Layer (Moves) - Dance/Movement Videos
- **Test File**: Upload .mp4 video of dance/movement
- **Expected**: AI analyzes video and generates movement-focused metadata
- **Generated Tags**: Tempo, style, body parts, complexity, synchronization

#### W Layer (Worlds) - Environment Images/Videos
- **Test File**: Upload image/video of setting/environment
- **Expected**: AI analyzes media and generates environment-focused metadata
- **Generated Tags**: Setting type, lighting, mood, scale, cultural context

### 3. UI Testing

#### Initial State
- [ ] AI section appears after file upload
- [ ] Shows "Generate Description & Tags with AI" button
- [ ] Button is disabled until layer/taxonomy selected
- [ ] Shows helpful description text

#### Generation Process
- [ ] Click "Generate Description & Tags with AI"
- [ ] Loading state shows "Analyzing with AI..."
- [ ] Progress indicator displays
- [ ] Success message appears when complete

#### Results Display
- [ ] Generated description auto-fills description field
- [ ] Generated tags auto-fill tags field
- [ ] Success chip shows "Generated"
- [ ] Timestamp shows when generated

#### Regeneration Options
- [ ] "Regenerate Description" button works
- [ ] "Regenerate Tags" button works
- [ ] "Regenerate Both" button works
- [ ] Loading states work for each option

### 4. Quality Testing

#### Description Quality
- [ ] Single paragraph (no line breaks)
- [ ] 7 sentences or fewer
- [ ] Layer-appropriate content
- [ ] Professional tone
- [ ] No formatting issues

#### Tags Quality
- [ ] Comma-separated format
- [ ] 40 tags or fewer
- [ ] Relevant to uploaded content
- [ ] Mix of one-word and hyphenated tags
- [ ] Covers primary dimensions for layer

#### AlgoRhythm Optimization
- [ ] Tags include genre-compatibility terms
- [ ] Description mentions matching characteristics
- [ ] Layer-specific optimization applied
- [ ] Cross-layer matching considerations

### 5. Error Handling

#### Configuration Errors
- [ ] Missing API key shows warning message
- [ ] Warning explains configuration requirement
- [ ] No crashes or breaking errors

#### Generation Errors
- [ ] Network errors display user-friendly message
- [ ] API errors show retry option
- [ ] Invalid responses handled gracefully
- [ ] Error dismissal works correctly

#### Edge Cases
- [ ] Very large files handle appropriately
- [ ] Unsupported file types show appropriate message
- [ ] Multiple rapid clicks don't cause issues
- [ ] Form submission works with/without AI generation

## Expected Results

### Successful Test Criteria
1. **AI Integration**: All UI components work correctly
2. **Generation Quality**: Descriptions and tags are relevant and well-formatted
3. **Layer Specificity**: Each layer generates appropriate content
4. **Error Handling**: Graceful failure and recovery
5. **Performance**: Fast generation (under 30 seconds)
6. **Form Integration**: Generated content integrates seamlessly

### Documentation
- Record any issues or unexpected behavior
- Note quality of generated content
- Document performance metrics
- Capture screenshots of successful generation

## Troubleshooting

### Common Issues
1. **"API key not configured"**: Check Vercel environment variables
2. **Generation fails**: Check network connectivity and API limits
3. **Poor quality results**: May need prompt refinement
4. **Slow generation**: Expected for vision analysis, up to 30 seconds

### Debug Information
- Check browser console for detailed logs
- Look for `🤖 AI Generation` log entries
- Monitor network requests to OpenAI API
- Verify file upload completion before AI generation

This testing ensures the AI integration works correctly before staging deployment.