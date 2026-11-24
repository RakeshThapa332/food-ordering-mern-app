import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Outlet } from "react-router-dom"

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40">
            <Navbar/>
        </header>
        <main className="flex-1">
            <Outlet/>
        </main>
        <Footer/>
    </div>
  )
}

export default MainLayout