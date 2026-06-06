import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import Leaderboard from "@/pages/Leaderboard";
import Pokemon from "@/pages/Pokemon";
import Cards from "@/pages/Cards";
import Shop from "@/pages/Shop";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...props }: { component: any, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/pokemon" component={Pokemon} />
          <Route path="/cards" component={Cards} />
          <Route path="/shop" component={Shop} />
          <Route path="/profile">
            {(params) => <ProtectedRoute component={Profile} path="/profile" {...params} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
