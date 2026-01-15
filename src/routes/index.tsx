import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Index })

function Index() {
  return (
    <div className="App">
      <h1>Welcome to TanStack Start</h1>
      <p>Start building your application here.</p>
    </div>
  )
}
