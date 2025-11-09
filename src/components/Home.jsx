import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">
        Smart Campus Entry System
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl">
        Secure and smart management of entry for University Admins, Department Admins,
        and Security Guards. Unauthorized entries are blocked, ensuring only authorized
        people can enter the campus.
      </p>

      <ul className="list-disc text-gray-700 mb-8 text-left max-w-lg">
        <li>🔐 Role-based secure login</li>
        <li>🪪 Face recognition authentication</li>
        <li>📋 Guest and visitor entry management</li>
        <li>📊 Reports & entry logs monitoring</li>
      </ul>
      {/* Button Link */}
      <Link to="/StudentAdmission">
        Go to Student Admission Form
      </Link>
    </div>
  )
}
export default Home;