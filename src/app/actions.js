'use server'

import { cookies } from 'next/headers'

export async function setClaimAmountAction(amount) {
  cookies().set('claimAmount', amount);
}