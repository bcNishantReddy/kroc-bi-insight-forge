
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Upload, 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  MessageCircle,
  Database,
  Settings,
  Download,
  FileText
} from "lucide-react";

export default function Info() {
  const features = [
    {
      icon: Upload,
      title: "Easy CSV Upload",
      description: "Upload your datasets in CSV format with drag-and-drop functionality. Support for files up to 100MB.",
      category: "Data Management"
    },
    {
      icon: Database,
      title: "Data Overview",
      description: "Get instant insights with data summaries, column statistics, missing value analysis, and data previews.",
      category: "Analysis"
    },
    {
      icon: TrendingUp,
      title: "Interactive Visualizations",
      description: "Create beautiful charts including bar charts, line graphs, scatter plots, histograms, and pie charts.",
      category: "Visualization"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Chat with Gemini AI to get deep insights, identify patterns, and discover correlations in your data.",
      category: "AI Features"
    },
    {
      icon: MessageCircle,
      title: "Natural Language Queries",
      description: "Ask questions in plain English and get intelligent responses about your data patterns and trends.",
      category: "AI Features"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is secure with user-specific access controls and encrypted storage. Only you can see your data.",
      category: "Security"
    },
    {
      icon: Zap,
      title: "Bundle Management",
      description: "Organize multiple datasets in separate bundles. Rename, search, and manage your data projects easily.",
      category: "Data Management"
    },
    {
      icon: Users,
      title: "User Authentication",
      description: "Secure sign-up and login system with email verification and password reset functionality.",
      category: "Security"
    },
    {
      icon: Settings,
      title: "Customizable Settings",
      description: "Configure AI model preferences, API keys, and personalize your analysis experience.",
      category: "Customization"
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Export your visualizations and analysis results in various formats for presentations and reports.",
      category: "Export"
    }
  ];

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <BarChart3 className="h-16 w-16 text-amber-600" />
        </div>
        <h1 className="text-4xl font-bold text-amber-800 mb-4">
          About Kroc-BI
        </h1>
        <p className="text-xl text-amber-600 mb-8 max-w-3xl mx-auto">
          Kroc-BI is a powerful business intelligence tool that transforms your CSV data into actionable insights 
          using AI-powered analysis, interactive visualizations, and intelligent chat capabilities.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-800">How It Works</CardTitle>
          <CardDescription className="text-lg">
            Transform your data in three simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">1. Upload Your Data</h3>
              <p className="text-amber-700">
                Upload your CSV file and create a bundle. Our system automatically analyzes your data structure.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">2. Explore & Visualize</h3>
              <p className="text-amber-700">
                Get instant insights, create interactive charts, and explore your data with our visualization tools.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">3. Chat with AI</h3>
              <p className="text-amber-700">
                Ask questions in natural language and get intelligent insights powered by Google Gemini AI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <div key={category}>
          <h2 className="text-2xl font-bold text-amber-800 mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.filter(f => f.category === category).map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 rounded-lg p-2">
                      <feature.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-amber-800">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {feature.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="bg-amber-50">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-800">Supported Data Types</CardTitle>
          <CardDescription>
            Kroc-BI works with various types of CSV data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Sales Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Financial Records</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Marketing Analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Customer Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Survey Results</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700">Operational Metrics</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-amber-800">Why Choose Kroc-BI?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-3">For Business Analysts</h3>
              <ul className="space-y-2 text-amber-700">
                <li>• Quick data insights without complex tools</li>
                <li>• Interactive visualizations for presentations</li>
                <li>• AI-powered trend analysis</li>
                <li>• Easy sharing and collaboration</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-3">For Data Scientists</h3>
              <ul className="space-y-2 text-amber-700">
                <li>• Rapid exploratory data analysis</li>
                <li>• Pattern recognition with AI assistance</li>
                <li>• Statistical summaries and outlier detection</li>
                <li>• API access for integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
