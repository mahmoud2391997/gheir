import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { InquiryProvider } from "./components/Inquiry";
import { Home } from "./pages/Home";
import { Systems } from "./pages/Systems";
import { SystemDetail } from "./pages/SystemDetail";
import { Collection } from "./pages/Collection";
import { RoomDetail } from "./pages/RoomDetail";
import { Design } from "./pages/Design";
import { Khanqah } from "./pages/Khanqah";
import { Studio } from "./pages/Studio";
import { Consultation } from "./pages/Consultation";
import { Visualization } from "./pages/Visualization";
import { Showroom } from "./pages/Showroom";
import { Pricing } from "./pages/Pricing";
import { Partners } from "./pages/Partners";
import { Contact } from "./pages/Contact";
import { PieceDetail } from "./pages/PieceDetail";
import { NotFound } from "./pages/NotFound";
import AdminPanel from "./components/AdminPanel";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

export default function App() {
  return (
    <InquiryProvider>
      <ScrollToTop />
      <Switch>
        <Route path="/admin" component={AdminPanel} />
        <Route path="/" component={Home} />
        <Route path="/systems" component={Systems} />
        <Route path="/systems/:slug" component={SystemDetail} />
        <Route path="/collection" component={Collection} />
        <Route path="/collection/:slug" component={RoomDetail} />
        <Route path="/design" component={Design} />
        <Route path="/khanqah" component={Khanqah} />
        <Route path="/studio" component={Studio} />
        <Route path="/consultation" component={Consultation} />
        <Route path="/visualization" component={Visualization} />
        <Route path="/showroom" component={Showroom} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/partners" component={Partners} />
        <Route path="/contact" component={Contact} />
        <Route path="/piece/:slug" component={PieceDetail} />
        <Route component={NotFound} />
      </Switch>
    </InquiryProvider>
  );
}
