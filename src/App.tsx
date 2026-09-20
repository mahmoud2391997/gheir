import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { InquiryProvider } from "./components/Inquiry";
import { Home } from "./legacy-pages/Home";
import { Systems } from "./legacy-pages/Systems";
import { SystemDetail } from "./legacy-pages/SystemDetail";
import { Collection } from "./legacy-pages/Collection";
import { RoomDetail } from "./legacy-pages/RoomDetail";
import { Design } from "./legacy-pages/Design";
import { Khanqah } from "./legacy-pages/Khanqah";
import { Studio } from "./legacy-pages/Studio";
import { Consultation } from "./legacy-pages/Consultation";
import { Visualization } from "./legacy-pages/Visualization";
import { Showroom } from "./legacy-pages/Showroom";
import { Pricing } from "./legacy-pages/Pricing";
import { Partners } from "./legacy-pages/Partners";
import { Contact } from "./legacy-pages/Contact";
import { PieceDetail } from "./legacy-pages/PieceDetail";
import { NotFound } from "./legacy-pages/NotFound";
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
