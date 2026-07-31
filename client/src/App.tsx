import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PomodoroPage from "@/pages/pomodoro";
import { BackgroundProvider } from "@/hooks/use-background";
import { BackgroundPicker } from "@/components/background-picker";
import { BackgroundMusicPlayer } from "@/components/background-music-player";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PomodoroPage} />
      <Route path="/pomodoro" component={PomodoroPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h1>
            <p className="text-slate-600">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <BackgroundProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <BackgroundPicker />
          <BackgroundMusicPlayer />
        </TooltipProvider>
      </QueryClientProvider>
    </BackgroundProvider>
  );
}

export default App;
