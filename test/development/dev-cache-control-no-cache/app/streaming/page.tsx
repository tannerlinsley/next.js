import { Suspense } from 'react'
import Counter from './counter'

async function Content() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return <p id="streamed">Stream complete</p>
}

export default function Page() {
  return (
    <>
      <Counter />
      <Suspense fallback={<p>Loading stream</p>}>
        <Content />
      </Suspense>
    </>
  )
}
