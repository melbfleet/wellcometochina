import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function SichuanDetail() {
  const experiences = [
    {
      id: 1,
      title: "Panda Encounter in Chengdu",
      location: "Chengdu Research Base",
      description: "Watch giant pandas munch bamboo, play, and lounge in their natural habitat. An intimate glimpse into conservation efforts protecting these beloved national treasures.",
      image: "",
      duration: "Half Day",
      bestTime: "Morning (8:00-10:00 AM)",
      layout: "horizontal-left" // Image left, text right
    },
    {
      id: 2,
      title: "Authentic Sichuan Hotpot",
      location: "Chengdu City",
      description: "Master the art of Sichuan hotpot with a local chef. Experience the numbing sensation of Sichuan peppercorns and fiery chilies.",
      image: "",
      duration: "3-4 Hours",
      bestTime: "Evening",
      layout: "vertical" // Vertical card
    },
    {
      id: 3,
      title: "Rural Baba Banquet",
      location: "Sichuan Countryside",
      description: "Join village families for an outdoor feast under the open sky. Toast with locals and discover authentic rural Sichuan hospitality.",
      image: "",
      duration: "Full Day",
      bestTime: "Weekends & Festivals",
      layout: "vertical" // Vertical card
    },
    {
      id: 4,
      title: "Traditional Tea Culture",
      location: "Chengdu Teahouse",
      description: "Experience Chengdu's leisurely pace at a traditional teahouse. Watch gongfu tea ceremonies and sip fragrant jasmine tea while locals play mahjong.",
      image: "",
      duration: "2-3 Hours",
      bestTime: "Afternoon",
      layout: "horizontal-right" // Text left, image right
    },
    {
      id: 5,
      title: "Leshan Giant Buddha",
      location: "Leshan City",
      description: "Stand before the world's largest stone Buddha, carved 1,200 years ago. This 71-meter UNESCO World Heritage masterpiece overlooks three rivers.",
      image: "",
      duration: "Full Day",
      bestTime: "Spring & Autumn",
      layout: "vertical" // Vertical card
    },
    {
      id: 6,
      title: "Jiuzhaigou Valley Paradise",
      location: "Jiuzhaigou National Park",
      description: "Enter a fairy-tale landscape of turquoise lakes, cascading waterfalls, and snow-capped peaks. UNESCO World Heritage site showcasing nature's artistry.",
      image: "",
      duration: "2-3 Days",
      bestTime: "Autumn (Sept-Nov)",
      layout: "vertical" // Vertical card
    }
  ];

  // Group experiences by layout pattern
  const renderExperience = (exp: typeof experiences[0]) => {
    if (exp.layout === "horizontal-left") {
      return (
        <div key={exp.id} className="grid grid-cols-1 lg:grid-cols-5 gap-0 mb-6 overflow-hidden relative">
          {/* Image Left - 60% */}
          <div 
            className="lg:col-span-3 aspect-[16/10] bg-cover bg-center"
            style={{ backgroundImage: `url(${exp.image})` }}
          ></div>
          
          {/* Text Right - 40% with blurred image background */}
          <div 
            className="lg:col-span-2 flex flex-col justify-center p-8 relative"
            style={{
              backgroundImage: `url(${exp.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-black/70"></div>
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-black/50 text-gray-300 text-xs font-body uppercase tracking-wider mb-4">
                {exp.location}
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                {exp.title}
              </h3>
              <p className="font-body text-base text-gray-300 leading-relaxed mb-6">
                {exp.description}
              </p>
              <div className="space-y-2 text-sm text-gray-400 font-body">
                <div><span className="text-gray-200">Duration:</span> {exp.duration}</div>
                <div><span className="text-gray-200">Best Time:</span> {exp.bestTime}</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (exp.layout === "horizontal-right") {
      return (
        <div key={exp.id} className="grid grid-cols-1 lg:grid-cols-5 gap-0 mb-6 overflow-hidden relative">
          {/* Text Left - 40% with blurred image background */}
          <div 
            className="lg:col-span-2 flex flex-col justify-center p-8 relative order-2 lg:order-1"
            style={{
              backgroundImage: `url(${exp.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-black/70"></div>
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-black/50 text-gray-300 text-xs font-body uppercase tracking-wider mb-4">
                {exp.location}
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                {exp.title}
              </h3>
              <p className="font-body text-base text-gray-300 leading-relaxed mb-6">
                {exp.description}
              </p>
              <div className="space-y-2 text-sm text-gray-400 font-body">
                <div><span className="text-gray-200">Duration:</span> {exp.duration}</div>
                <div><span className="text-gray-200">Best Time:</span> {exp.bestTime}</div>
              </div>
            </div>
          </div>
          
          {/* Image Right - 60% */}
          <div 
            className="lg:col-span-3 aspect-[16/10] bg-cover bg-center order-1 lg:order-2"
            style={{ backgroundImage: `url(${exp.image})` }}
          ></div>
        </div>
      );
    } else {
      // Vertical card with blurred image background
      return (
        <div key={exp.id} className="flex flex-col overflow-hidden">
          {/* Image Top */}
          <div 
            className="aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: `url(${exp.image})` }}
          ></div>
          
          {/* Text Bottom with blurred image background */}
          <div 
            className="p-6 flex-1 relative"
            style={{
              backgroundImage: `url(${exp.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-black/70"></div>
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-black/50 text-gray-300 text-xs font-body uppercase tracking-wider mb-3">
                {exp.location}
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-white mb-3">
                {exp.title}
              </h3>
              <p className="font-body text-sm text-gray-300 leading-relaxed mb-4">
                {exp.description}
              </p>
              <div className="space-y-1 text-xs text-gray-400 font-body">
                <div><span className="text-gray-200">Duration:</span> {exp.duration}</div>
                <div><span className="text-gray-200">Best Time:</span> {exp.bestTime}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navigation />

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] w-full"
        style={{
          backgroundImage: ', ',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="font-display text-5xl md:text-7xl font-normal mb-4 tracking-wider">
              SICHUAN
            </h1>
            <p className="font-display text-lg md:text-xl max-w-2xl mx-auto opacity-95">
              Where Ancient Culture Meets Natural Wonders
            </p>
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-16 bg-black">
        <div className="container max-w-7xl">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-16 text-white tracking-wide">
            SICHUAN EXPERIENCES
          </h2>
          
          {/* Experience 1: Horizontal Left */}
          {renderExperience(experiences[0])}
          
          {/* Experience 2 & 3: Two Vertical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderExperience(experiences[1])}
            {renderExperience(experiences[2])}
          </div>
          
          {/* Experience 4: Horizontal Right */}
          {renderExperience(experiences[3])}
          
          {/* Experience 5 & 6: Two Vertical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderExperience(experiences[4])}
            {renderExperience(experiences[5])}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6 tracking-wide">
            Ready to Explore Sichuan?
          </h2>
          <p className="font-body text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Let us craft a personalized journey through Sichuan's most captivating experiences
          </p>
          <Link href="/make-an-enquiry">
            <button className="bg-[#F5F3EF] hover:bg-gray-100 text-black font-body px-10 py-4 text-base uppercase tracking-wider transition-colors">
              Plan Your Trip
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
