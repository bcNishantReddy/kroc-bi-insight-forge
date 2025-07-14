import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Upload, Brain, TrendingUp, Shield, Zap, 
  Clock, Users, Sparkles, ArrowRight, CheckCircle, 
  Database, MessageSquare, PieChart 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Lightning Fast CSV Upload",
      description: "Drag, drop, and analyze your datasets instantly with our intelligent CSV processor",
      color: "text-amber-600"
    },
    {
      icon: PieChart,
      title: "Interactive Visualizations",
      description: "Create stunning charts with dynamic X/Y axis selection and real-time filtering",
      color: "text-orange-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Chat with advanced AI to uncover hidden patterns and get actionable insights",
      color: "text-amber-700"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption with user-specific access controls and data privacy",
      color: "text-orange-700"
    },
    {
      icon: Database,
      title: "Smart Bundle Management",
      description: "Organize unlimited datasets in intuitive bundles with version control",
      color: "text-amber-500"
    },
    {
      icon: MessageSquare,
      title: "Conversational Analytics",
      description: "Ask questions in plain English and get instant, detailed data explanations",
      color: "text-orange-500"
    }
  ];

  const benefits = [
    "Turn data into decisions in minutes, not hours",
    "No coding skills required - intuitive interface",
    "Scale from personal projects to enterprise datasets",
    "Export insights in multiple formats",
    "Collaborate with team members seamlessly"
  ];

  const stats = [
    { number: "10K+", label: "Data Scientists" },
    { number: "500M+", label: "Rows Analyzed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <BarChart3 className="h-20 w-20 text-amber-600 animate-float" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-amber-100 text-amber-800 border-amber-300">
            🚀 Now with Advanced AI Analytics
          </Badge>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-6">
            Kroc-BI
          </h1>
          <p className="text-2xl text-amber-700 mb-4 max-w-3xl mx-auto font-medium">
            Transform Your Data Into Strategic Advantages
          </p>
          <p className="text-lg text-amber-600 mb-10 max-w-2xl mx-auto">
            The most intuitive business intelligence platform that combines AI-powered analysis, 
            interactive visualizations, and natural language querying in one powerful tool.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold animate-pulse-glow group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/info")}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 px-8 py-3 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-fade-in-up">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-amber-800 mb-2">{stat.number}</div>
              <div className="text-amber-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-amber-600 max-w-2xl mx-auto">
              Powerful features designed to make data analysis effortless and insightful
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white/90 backdrop-blur-sm border-amber-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-amber-800 text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-amber-700 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20 animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-800 mb-4">
              Why Choose Kroc-BI?
            </h2>
            <p className="text-xl text-amber-600">
              Join thousands of professionals who've transformed their data workflow
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-4 bg-white/80 rounded-lg border border-amber-200 hover:bg-white/90 transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-amber-800 font-medium text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-20 animate-fade-in-up">
          <Card className="bg-gradient-to-r from-amber-600 to-orange-600 border-0 text-white">
            <CardContent className="p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 mr-3" />
                <span className="text-2xl font-bold">Save 85% of Your Analysis Time</span>
              </div>
              <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                What used to take hours now takes minutes. Our users report dramatic time savings 
                and significantly better insights from their data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold mb-2">85%</div>
                  <div className="text-amber-100">Time Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">300%</div>
                  <div className="text-amber-100">Faster Insights</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">95%</div>
                  <div className="text-amber-100">User Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-amber-200 shadow-2xl animate-fade-in-up">
          <Users className="h-12 w-12 text-amber-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-amber-800 mb-6">
            Ready to Transform Your Data Analysis?
          </h2>
          <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
            Join over 10,000 data professionals who trust Kroc-BI to turn their data into competitive advantages.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-4 text-xl font-semibold group"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <p className="text-sm text-amber-600">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}