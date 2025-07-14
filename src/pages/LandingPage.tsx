
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Upload, Brain, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Easy CSV Upload",
      description: "Upload your datasets in CSV format and get instant insights"
    },
    {
      icon: TrendingUp,
      title: "Interactive Visualizations",
      description: "Create beautiful charts with custom X/Y axis selection"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Chat with Gemini AI to get deep insights from your data"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is secure with user-specific access controls"
    },
    {
      icon: Zap,
      title: "Bundle Management",
      description: "Organize multiple datasets in separate bundles"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <BarChart3 className="h-16 w-16 text-amber-600" />
          </div>
          <h1 className="text-5xl font-bold text-amber-800 mb-6">
            Kroc-BI
          </h1>
          <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
            Transform your CSV data into actionable insights with AI-powered analysis, 
            interactive visualizations, and intelligent chat capabilities.
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/info")}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-amber-600 mb-2" />
                <CardTitle className="text-amber-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-amber-200">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">
            Ready to unlock your data's potential?
          </h2>
          <p className="text-amber-700 mb-6">
            Join thousands of users who trust Kroc-BI for their data analysis needs.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
