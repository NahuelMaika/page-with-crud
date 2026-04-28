import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserProfile from '@/components/profile/UserProfile'

export default function ProfilePage() {
  return (
    <div className='flex h-screen items-center justify-center p-4'>
      <div className='relative w-full max-w-md'>
        <Button
          variant='ghost'
          size='icon'
          className='absolute left-2 top-2 z-10'
          asChild
        >
          <Link href='/dashboard' aria-label='Volver al dashboard'>
            <ArrowLeft className='size-5' />
          </Link>
        </Button>
        <UserProfile />
      </div>
    </div>
  )
}
