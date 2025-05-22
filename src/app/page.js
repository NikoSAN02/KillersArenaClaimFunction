import { Suspense } from 'react'
import ClaimComponent from './components/ClaimComponent'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimComponent />
    </Suspense>
  )
}
