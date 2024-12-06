'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Nagorik Desk
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
              <Link href="/sectors" className="text-gray-600 hover:text-blue-600">Sectors</Link>
              <Link href="/reports" className="text-gray-600 hover:text-blue-600">Reports</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-6 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Your Voice Shapes Our Future
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Join our citizen engagement platform to report issues, track progress, and participate in building a better community through transparent governance.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Submit Report
              </Link>
              <Link href="/dashboard" className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View Progress
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">5000+</h3>
                <p className="text-gray-600">Issues Resolved</p>
              </div>
              <div className="p-6">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">15</h3>
                <p className="text-gray-600">Government Sectors</p>
              </div>
              <div className="p-6">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">50K+</h3>
                <p className="text-gray-600">Active Citizens</p>
              </div>
              <div className="p-6">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">98%</h3>
                <p className="text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Nagorik Desk</h4>
              <p className="text-gray-400">Empowering citizens through transparent governance and efficient problem resolution.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/sectors" className="text-gray-400 hover:text-white">Sectors</Link></li>
                <li><Link href="/reports" className="text-gray-400 hover:text-white">Reports</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Sectors</h4>
              <ul className="space-y-2">
                <li><Link href="/sectors/education" className="text-gray-400 hover:text-white">Education</Link></li>
                <li><Link href="/sectors/health" className="text-gray-400 hover:text-white">Healthcare</Link></li>
                <li><Link href="/sectors/transport" className="text-gray-400 hover:text-white">Transportation</Link></li>
                <li><Link href="/sectors/infrastructure" className="text-gray-400 hover:text-white">Infrastructure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2023 Nagorik Desk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Report Issues",
    description: "Submit detailed reports about problems in your area across various government sectors.",
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  },
  {
    title: "Track Progress",
    description: "Monitor the status of your reports and stay updated on resolution progress in real-time.",
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  },
  {
    title: "Vote on Solutions",
    description: "Participate in the democratic process by voting on proposed solutions to community problems.",
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  }
];
