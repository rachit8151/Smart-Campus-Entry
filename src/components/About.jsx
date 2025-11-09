import React from 'react'
import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">About Us</h1>
      <p className="text-gray-700 text-lg mb-4">
        The <strong>Smart Campus Entry System</strong> is a project designed to enhance
        security inside universities by ensuring that only authorized individuals
        can enter the campus.
      </p>
      <p className="text-gray-700 text-lg mb-4">
        Our system integrates <strong>role-based access control</strong> and
        <strong> face recognition authentication</strong> to provide a safe and
        reliable environment. University Admins can register and manage users,
        Department Admins can monitor students and guests, and Security Guards
        can verify and allow entry.
      </p>
      <p className="text-gray-700 text-lg">
        With this system, universities can prevent unauthorized entries, monitor
        logs in real-time, and improve overall campus security.
      </p>

      {/* <div className="mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div> */}
    </div>
  )
}
export default About