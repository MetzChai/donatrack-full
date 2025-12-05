"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white">
      {/* About Us Section */}
      <section className="container mx-auto px-4 py-16">

        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
            About Us. See Where Your Money Goes.
          </h1>
          <p className="text-lg text-gray-300">
            Getting Change with Radical Transparency
          </p>
        </div>

        <div className="mb-14">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
            alt="Team collaboration"
            className="w-full h-96 object-cover rounded-2xl shadow-2xl border border-white/10"
          />
        </div>

        {/* Mission Section */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-10 mb-14">
          <h2 className="text-3xl font-extrabold mb-2 text-emerald-300">
            BRIDGING GENEROSITY AND IMPACT
          </h2>
          <p className="text-lg text-gray-300 mb-8">Our Mission</p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-cyan-200">What Makes Us Different?</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-gray-200">Simple. Traceability</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-gray-200">User-friendly</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-gray-200">Fund Specific, Tangible Goals</span>
              </li>
            
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-gray-200">Clear-cut Head Breakdown</span>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-cyan-200">Why Us?</h3>
            <p className="text-gray-300 leading-relaxed">
              At DONATRACK, we believe in complete transparency. Every donation you make is tracked,
              verified, and reported back to you. We ensure that your contributions reach the intended
              recipients and make a real impact. Our platform provide updates on campaign
              progress, so you can see exactly how your generosity is changing lives.
            </p>
          </div>

          <Link
            href="/campaigns"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-500 hover:opacity-80 text-white px-10 py-3 rounded-xl font-semibold shadow-md transition"
          >
            Donate
          </Link>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
            Meet Our Leadership & Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Clark Valle",
                role: "Field Manager",
                img: "Clark.png",
              },
              {
                name: "Remar Sansait",
                role: "Tech Lead",
                img: "Remar.jpg",
              },
              {
                name: "Metz S. Tura",
                role: "Program Manager",
                img: "metz-id.jpg",
              },
              {
                name: "Karen C. Cantalaba",
                role: "Director",
                img: "kAREN.png",
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className="text-center bg-white/10 rounded-2xl p-6 border border-white/10 shadow-xl hover:-translate-y-1 transition"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-emerald-300 shadow-lg">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-gray-300 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
