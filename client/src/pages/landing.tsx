import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoNew from "@assets/logonew_1752473435452.png";
import { Clock, BarChart3, Target, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <img 
            src={logoNew} 
            alt="Pomorange Logo" 
            className="h-8 w-8 rounded-lg"
          />
          <h1 className="text-2xl font-bold text-[#F3793A]">Pomorange</h1>
        </div>
        <Button onClick={handleLogin} className="btn-primary">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <img 
            src={logoNew} 
            alt="Pomorange Logo" 
            className="h-24 w-24 mx-auto mb-6 rounded-2xl shadow-lg"
          />
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Focus Better with <span className="text-[#F3793A]">Pomorange</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            A beautiful Pomodoro timer that helps you stay focused, track your productivity, 
            and build better work habits with advanced analytics and customizable sessions.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started - It's Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="card-orange-border text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-[#F3793A] mb-4" />
              <CardTitle className="text-lg">Smart Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customizable focus and break durations with audio notifications
              </p>
            </CardContent>
          </Card>

          <Card className="card-orange-border text-center">
            <CardHeader>
              <Target className="h-12 w-12 mx-auto text-[#147E50] mb-4" />
              <CardTitle className="text-lg">Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organize your work with tasks, notes, and tags for better planning
              </p>
            </CardContent>
          </Card>

          <Card className="card-orange-border text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-[#BE8669] mb-4" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your productivity with detailed reports and insights
              </p>
            </CardContent>
          </Card>

          <Card className="card-orange-border text-center">
            <CardHeader>
              <Zap className="h-12 w-12 mx-auto text-[#F3793A] mb-4" />
              <CardTitle className="text-lg">Stay Motivated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Celebrate achievements with confetti and maintain your focus streak
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg card-orange-border">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Join thousands of users who have improved their focus with Pomorange
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="btn-primary text-lg px-8 py-3"
          >
            Start Your First Session
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-orange-200 text-center text-slate-600">
        <p>&copy; 2025 Pomorange. Built with focus in mind.</p>
      </footer>
    </div>
  );
}