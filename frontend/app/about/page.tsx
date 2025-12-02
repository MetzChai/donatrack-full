"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* About Us Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            About Us. See Where Every Dollar Goes.
          </h1>
          <p className="text-xl text-gray-600">Getting Change with Radical Transparency</p>
        </div>

        <div className="mb-12">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
            alt="Team collaboration"
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Mission Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">BRIDGING GENEROSITY AND IMPACT</h2>
          <p className="text-xl text-gray-600 mb-6">Our Mission</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">What Makes Us Different?</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Action to World Transparency</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Verified Recipient Confirmation</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Real-Time Impact Feedback</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Fund-raising, No Tangible Goods</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Clear-cut Head Breakdown</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Why Us?</h3>
            <p className="text-gray-700 leading-relaxed">
              At DONATRACK, we believe in complete transparency. Every donation you make is tracked,
              verified, and reported back to you. We ensure that your contributions reach the intended
              recipients and make a real impact. Our platform provides real-time updates on campaign
              progress, so you can see exactly how your generosity is changing lives.
            </p>
          </div>

          <Link
            href="/campaigns"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Donate
          </Link>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Meet Our Leadership & Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Margaret P. Reyes", role: "Field Manager" },
              { name: "Rami J. Samson", role: "Tech Lead" },
              { name: "Metzi S. Tura", role: "Program Manager" },
              { name: "Karen C. Cantalaba", role: "Director" },
            ].map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="w-32 h-32 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

