import React from 'react'

export default function DashboardPage() {
  return (
    <div>DashboardPage
      <div>
        <form action="/api/auth/signout" method="post">
          <button className="button block" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
