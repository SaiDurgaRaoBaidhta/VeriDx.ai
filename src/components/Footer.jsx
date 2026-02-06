import { Link } from 'react-router-dom'
import logo from '../Images/logo.jpeg'
export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/80 text-medical-navy">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="font-display font-bold text-xl text-medical-navy flex items-center gap-2">
          <img src={logo} alt="VeriDx.ai" className="w-8 h-8" />
          VeriDx<span className="text-primary-400">.ai</span>
        </Link>
        <p className="text-sm text-slate-800 text-center sm:text-left max-w-md">
          The Truth, Diagnosed — AI-Powered Intelligence for Medical Malpractice
        </p>
        <a
          href="mailto:hello@veridx.ai"
          className="text-md font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          hello@veridx.ai
        </a>
      </div>
    </footer>
  )
}
