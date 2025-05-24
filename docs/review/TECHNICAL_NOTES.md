# NNA Registry Service - Technical Notes

## Development Environment

The application is developed with:

- Node.js v22.14.0
- npm package manager
- React 18 with TypeScript
- Material UI v6+
- React Router v6

## Build and Test Commands

```bash
# Install dependencies
npm install

# Development
npm start               # Start development server
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier

# Testing
npm test                # Run tests
npm test ComponentName  # Test a specific component

# Production
npm run build           # Build for production
npm run serve           # Serve production build locally

# API Testing
node complete-api-test.mjs YOUR_TOKEN_HERE  # Test asset creation

# Taxonomy Tools
npm run flatten-taxonomy  # Generate flattened taxonomy
npm run test-taxonomy     # Test taxonomy mappings
```

## Code Organization

The codebase follows a feature-based organization with shared components:

```
/src
  /api           # API integration
  /assets        # Static assets
  /components    # Shared components
    /asset       # Asset-related components
    /common      # Common UI components
    /layout      # Layout components
    /taxonomy    # Taxonomy-related components
  /contexts      # React contexts
  /hooks         # Custom React hooks
  /pages         # Page components
  /providers     # Data providers
  /services      # Business logic services
  /styles        # Global styles
  /types         # TypeScript types
  /utils         # Utility functions
```

## Key Patterns and Practices

### Component Design

- Functional components with hooks
- Props interface definitions
- Default prop values
- Component memoization with React.memo
- Separation of container and presentational components

Example:
```typescript
interface TaxonomyItemProps {
  item: TaxonomyItem;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  dataTestId: string;
}

const TaxonomyItem: React.FC<TaxonomyItemProps> = ({
  item,
  isActive,
  onClick,
  onDoubleClick,
  dataTestId
}) => {
  // Component implementation
};

export default React.memo(TaxonomyItem);
```

### State Management

- React Context API for global state
- Local component state with useState
- Custom hooks for reusable state logic
- Session storage for persistence
- Form state with React Hook Form

Example:
```typescript
const { 
  selectedLayer, 
  selectLayer, 
  loading 
} = useTaxonomy();

// Component local state
const [error, setError] = useState<string | null>(null);
```

### Error Handling

- Try/catch blocks for async operations
- Error boundaries for component errors
- Global error handler for unhandled errors
- User feedback for errors
- Fallback UI for error states

Example:
```typescript
try {
  const result = await someAsyncOperation();
  // Handle success
} catch (error) {
  // Handle error
  setError(error.message);
  logError('Operation failed', error);
}
```

### API Integration

- Axios for HTTP requests
- Service layer for API operations
- Request/response type definitions
- Error handling middleware
- Authentication header management

Example:
```typescript
async function getAsset(id: string): Promise<Asset> {
  try {
    const response = await axios.get(`/api/assets/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
```

### Performance Optimization

- React.memo for component memoization
- useMemo for expensive calculations
- useCallback for stable callbacks
- Code splitting with React.lazy
- Virtualization for long lists

Example:
```typescript
// Memoize expensive calculation
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Stable callback reference
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

## Special Considerations

### Taxonomy Data Structure

The taxonomy data is organized in a hierarchical structure:

- Layers (top level)
- Categories (mid level)
- Subcategories (bottom level)

Each level has a code (e.g., "POP") and a numeric code (e.g., "001") for dual addressing.

### File Upload Process

File upload follows a multi-step process:

1. Client-side validation (type, size)
2. File selection and preview
3. Form submission with FormData
4. Backend validation and storage
5. Response with file metadata

### Asset Registration Workflow

The asset registration process follows these steps:

1. Layer selection
2. Category and subcategory selection
3. File upload
4. Metadata entry
5. Review and submit
6. Success confirmation

## Known Challenges

### Browser Compatibility

The application is tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

IE11 is not supported.

### Performance with Large Datasets

The application may experience performance issues with:
- Very large taxonomy datasets
- Large numbers of assets in search results
- Multiple large file uploads

Optimizations are ongoing.

### Mobile Experience

The mobile experience has limitations:
- Complex forms are challenging on small screens
- File upload may be limited on some mobile browsers
- Performance may be reduced on older mobile devices

## Testing Approach

The project uses:
- Jest for unit testing
- React Testing Library for component tests
- Mock service worker for API mocking
- Manual testing for UI workflows

Coverage focuses on:
- Core components
- Critical business logic
- Error handling paths
- Edge cases in taxonomy handling