import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from '@/pages/Home';
import Destinations from '@/pages/Destinations';
import DestinationsMap from '@/pages/DestinationsMap';
import Sichuan from '@/pages/Sichuan';
import Experiences from "./pages/Experiences";
import About from "./pages/About";
import SichuanDetail from "./pages/SichuanDetail";
import Contact from "./pages/Contact";
import PlanYourTrip from './pages/PlanYourTrip';
import ExperienceDetail from './pages/ExperienceDetail';
import YunnanDetail from './pages/YunnanDetail';
import FontShowcase from "./pages/FontShowcase";
import TeaMountains from "./pages/TeaMountains";
import WhyUs from "./pages/WhyUs";
import OurTeam from "./pages/OurTeam";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCities from "./pages/AdminCities";
import AdminExperiences from "./pages/AdminExperiences";
import AdminWaysToTravel from "./pages/AdminWaysToTravel";
import AdminItineraries from "./pages/AdminItineraries";
import AdminTags from "./pages/AdminTags";
import AdminMediaLibrary from "./pages/AdminMediaLibrary";
import AdminAbout from "./pages/AdminAbout";
import AdminAboutOurTeam from "./pages/AdminAboutOurTeam";
import AdminAboutWhyUs from "./pages/AdminAboutWhyUs";
import AdminExperiencesByType from "./pages/AdminExperiencesByType";
import AdminWaysToTravelByType from "./pages/AdminWaysToTravelByType";
import AdminExperiencesByCity from "./pages/AdminExperiencesByCity";
import AdminExperienceEdit from "./pages/AdminExperienceEdit";
import AdminWayToTravelEdit from "./pages/AdminWayToTravelEdit";
import AdminCityEdit from "./pages/AdminCityEdit";
import AdminHomepage from "./pages/AdminHomepage";
import AdminContactInformation from "./pages/AdminContactInformation";

import ExperienceCategoryPage from "./pages/ExperienceCategoryPage";
import WaysToTravel from "./pages/WaysToTravel";
import WayToTravelDetail from "./pages/WayToTravelDetail";
import CityPage from "./pages/CityPage";
import CMSAdmin from "./pages/CMSAdmin";
import ItineraryDetail from "./pages/ItineraryDetail";
import { trpc } from "@/lib/trpc";

function SiteBranding() {
  const { data: assets } = trpc.media.getHomepageAssets.useQuery();
  const icon = assets?.icon;

  React.useEffect(() => {
    const definitions = [
      { id: "site-favicon", rel: "icon" },
      { id: "site-apple-touch-icon", rel: "apple-touch-icon" },
    ];

    for (const definition of definitions) {
      let link = document.getElementById(definition.id) as HTMLLinkElement | null;
      if (!icon?.url) {
        link?.remove();
        continue;
      }
      if (!link) {
        link = document.createElement("link");
        link.id = definition.id;
        link.rel = definition.rel;
        document.head.appendChild(link);
      }
      link.href = icon.url;
      if (definition.rel === "icon") link.type = icon.mimeType || "image/png";
    }
  }, [icon?.url, icon?.mimeType]);

  return null;
}

/**
 * App Router & Layout
 * Design: Light theme with elegant luxury travel aesthetic
 * Color scheme: Warm golds, deep charcoal, cream whites
 */
function Router() {
  const [location] = useLocation();
  
  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/destinations/sichuan" component={Sichuan} />
      <Route path="/destinations/:slug" component={CityPage} />
      <Route path="/experiences" component={Experiences} />
      <Route path="/about" component={About} />
      <Route path="/make-an-enquiry" component={Contact} />
      <Route path="/plan-your-trip" component={PlanYourTrip} />
      <Route path="/experiences/2" component={YunnanDetail} />
      <Route path="/experiences/tea-mountains-yaan" component={TeaMountains} />
      <Route path="/template/experience" component={TeaMountains} />
      <Route path="/template/city" component={Sichuan} />
      <Route path="/template/itinerary" component={YunnanDetail} />
      <Route path="/itinerary/:slug" component={ItineraryDetail} />
      <Route path="/about/why-us" component={WhyUs} />
      <Route path="/about/our-team" component={OurTeam} />
      <Route path="/experiences/:categorySlug/:id" component={ExperienceDetail} />
      <Route path="/experiences/:categorySlug" component={ExperienceCategoryPage} />
      <Route path="/experience-preview/:slug" component={ExperienceDetail} />
      <Route path="/ways-to-travel" component={WaysToTravel} />
      <Route path="/ways-to-travel/preview/:slug" component={WayToTravelDetail} />
      <Route path="/ways-to-travel/:categorySlug/:id" component={WayToTravelDetail} />
      <Route path="/font-showcase" component={FontShowcase} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cms" component={CMSAdmin} />
      <Route path="/admin/enquiries" component={AdminEnquiries} />
      <Route path="/admin/cities" component={AdminCities} />
      <Route path="/admin/cities/:id/edit" component={AdminCityEdit} />
      <Route path="/admin/cities/:cityId/experiences" component={AdminExperiencesByCity} />
      <Route path="/admin/experiences" component={AdminExperiences} />
      <Route path="/admin/experiences/type/:typeId" component={AdminExperiencesByType} />
      <Route path="/admin/experiences/edit/:id" component={AdminExperienceEdit} />
      <Route path="/admin/ways-to-travel" component={AdminWaysToTravel} />
      <Route path="/admin/ways-to-travel/type/:typeId" component={AdminWaysToTravelByType} />
      <Route path="/admin/ways-to-travel/edit/:id" component={AdminWayToTravelEdit} />
      <Route path="/admin/itineraries" component={AdminItineraries} />
      <Route path="/admin/tags" component={AdminTags} />
      <Route path="/admin/media" component={AdminMediaLibrary} />
      <Route path="/admin/about" component={AdminAbout} />
      <Route path="/admin/about/our-team" component={AdminAboutOurTeam} />
      <Route path="/admin/about/why-us" component={AdminAboutWhyUs} />
      <Route path="/admin/homepage" component={AdminHomepage} />
      <Route path="/admin/contact-information" component={AdminContactInformation} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SiteBranding />
          <Toaster />
          <Router />
          </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
