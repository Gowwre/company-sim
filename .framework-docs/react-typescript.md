# React 19 + TypeScript Quick Reference

## React 19 Key Changes

### 1. Ref as Prop

```typescript
// React 19 - ref is now a regular prop
function Input({ ref, ...props }: React.ComponentProps<"input"> & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// Usage
<Input ref={inputRef} placeholder="Type here" />
```

### 2. Actions

```typescript
// useActionState for form actions
const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
  // Server action or async operation
  return { success: true };
}, initialState);

// useFormStatus for pending state inside forms
const { pending, data, method, action } = useFormStatus();
```

### 3. use() API

```typescript
// Use promises or context directly in render
const data = use(fetchData());
const theme = use(ThemeContext);
```

---

## Component Typing Patterns

### Basic Props Interface

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  // Implementation
}
```

### Polymorphic Components

```typescript
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children'>;

function Container<T extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}
```

### Generic Components

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

---

## Hook Typing

### useState

```typescript
// Type inference works for primitives
const [count, setCount] = useState(0);

// Explicit types for complex state
const [user, setUser] = useState<User | null>(null);

// Functional updates
setCount((prev) => prev + 1);
```

### useReducer

```typescript
type Action =
  | { type: 'increment'; payload: number }
  | { type: 'decrement'; payload: number }
  | { type: 'reset' };

interface State {
  count: number;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.payload };
    case 'decrement':
      return { count: state.count - action.payload };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
```

### useCallback & useMemo

```typescript
// Type inference from function signature
const handleClick = useCallback((id: string) => {
  console.log(id);
}, []);

// useMemo with explicit return type
const expensiveValue = useMemo<number>(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Custom Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

---

## Event Handling

### Form Events

```typescript
function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

### Mouse/Keyboard Events

```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.clientX, e.clientY);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    // Handle enter
  }
};
```

---

## Type Utilities

### Built-in React Types

```typescript
React.ReactNode; // Anything renderable
React.ReactElement; // JSX element
React.ComponentType; // Class or function component
React.PropsWithChildren; // Adds children prop
```

### ComponentProps

```typescript
// Get all props from a component or HTML element
type ButtonProps = React.ComponentProps<'button'>;
type CustomButtonProps = React.ComponentProps<typeof Button>;
```

### TypeScript Utility Types

```typescript
// Partial - all properties optional
interface User {
  name: string;
  age: number;
}
type PartialUser = Partial<User>;

// Required - all properties required
type RequiredUser = Required<PartialUser>;

// Pick - select specific properties
type UserName = Pick<User, 'name'>;

// Omit - remove specific properties
type UserWithoutAge = Omit<User, 'age'>;

// Record - object with specific key/value types
type UserMap = Record<string, User>;

// Exclude/Extract - union type manipulation
type NonString = Exclude<string | number | boolean, string>;
```

---

## Best Practices

### 1. Prefer Interface over Type for Object Shapes

```typescript
// Good
interface User {
  name: string;
  age: number;
}

// Use type for unions
type Status = 'loading' | 'success' | 'error';
```

### 2. Use const assertions for literal types

```typescript
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// config.apiUrl is type 'https://api.example.com' not string
```

### 3. Discriminated Unions for State

```typescript
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

### 4. Avoid any, use unknown

```typescript
// Bad
function process(data: any) {
  return data.value;
}

// Good
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
}
```

### 5. Generic Constraints

```typescript
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
```

---

## Common Patterns

### Container/Presentational Pattern

```typescript
// Container - handles data and logic
function UserListContainer() {
  const { data, isLoading } = useQuery(['users'], fetchUsers);

  if (isLoading) return <Spinner />;
  return <UserList users={data} />;
}

// Presentational - purely UI
interface UserListProps {
  users: User[];
}

function UserList({ users }: UserListProps) {
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Compound Component Pattern

```typescript
const TabsContext = React.createContext<{ activeTab: string } | null>(null);

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be used within Tabs');
  return <button onClick={() => ctx.setActiveTab(id)}>{children}</button>;
}

Tabs.Tab = Tab;
```

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  render: (data: T | null, isLoading: boolean) => React.ReactNode;
}

function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [url]);

  return <>{render(data, isLoading)}</>;
}
```
