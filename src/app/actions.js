
'use server'

import { cookies } from 'next/headers'

export async function setClaimAmountAction(amount) {
  const cookieStore = await cookies();
  cookieStore.set('claimAmount', amount.toString());
}