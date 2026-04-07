import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import LandingPage from "@/pages/LandingPage";
import ApplyPage from "@/pages/ApplyPage";
import ResultsPage from "@/pages/ResultsPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/apply" component={ApplyPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
