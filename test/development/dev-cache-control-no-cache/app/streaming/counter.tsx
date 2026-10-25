'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <>
      <p id="count">Count: {count}</p>
      <button id="increment" onClick={() => setCount((value) => value + 1)}>
        Increment
      </button>
    </>
  )
}
