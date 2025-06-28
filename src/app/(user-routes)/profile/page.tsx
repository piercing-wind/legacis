import Profile from '@/components/profile/profile'
import React from 'react'
import Transaction from '@/components/profile/transaction'
import { Session } from '@/actions/session';
import { User } from 'next-auth';
import { findUserById, getUserTransactions } from '@/lib/data/user';
import { getUserRiskProfileById } from '@/lib/data/admin/risk-profile';

const Page = async () => {
   const session = await Session();
   const user : User = session?.user;

   let fullUserData = null;
   let userTransactions = null;
   let riskProfile = null;

   if(user && user.id){
      [fullUserData, userTransactions, riskProfile] = await Promise.all([
         findUserById(user.id),
         getUserTransactions(user.id),
         getUserRiskProfileById(user.id)
      ]);
   }

  return (
    <main className="w-full px-5 md:px-24 min-h-screen ">
      <Profile user={user} fullUserData={fullUserData} riskProfile={riskProfile}/>
      <Transaction userTransactions={userTransactions}/>
    </main>
  )
}

export default Page
