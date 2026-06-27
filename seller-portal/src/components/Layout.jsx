import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '0px' }}
      >
        {/* Top Navigation */}
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto pt-16"
          style={{ backgroundColor: 'var(--cream)' }}
        >
          <div className="p-6 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
