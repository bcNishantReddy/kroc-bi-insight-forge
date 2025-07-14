
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Zap, Crown } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: CreditCard,
      description: "Perfect for getting started with data analysis",
      features: [
        "Up to 5 bundles",
        "Files up to 10MB",
        "Basic visualizations",
        "Limited AI chat (100 messages/month)",
        "Email support"
      ],
      limitations: [
        "No advanced analytics",
        "Limited export options"
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      icon: Zap,
      description: "For professionals who need advanced features",
      features: [
        "Unlimited bundles",
        "Files up to 100MB",
        "All visualization types",
        "Unlimited AI chat",
        "Advanced analytics",
        "Custom charts",
        "API access",
        "Priority support"
      ],
      limitations: [],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      icon: Crown,
      description: "For teams and organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "SSO integration",
        "Custom integrations",
        "Dedicated support",
        "On-premise deployment",
        "Custom training",
        "SLA guarantee"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-800 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-amber-600 mb-8">
          Select the perfect plan for your data analysis needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card key={index} className={`relative ${plan.popular ? 'border-amber-500 shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <plan.icon className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-amber-800">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-amber-900">
                {plan.price}
                <span className="text-lg font-normal text-amber-600">/{plan.period}</span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-amber-800 mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-amber-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-800 mb-3">Limitations:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span className="text-amber-600 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                variant={plan.buttonVariant}
                className="w-full"
                disabled={plan.name === "Free"}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">Can I change my plan anytime?</h4>
            <p className="text-amber-700">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">What payment methods do you accept?</h4>
            <p className="text-amber-700">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">Is there a free trial?</h4>
            <p className="text-amber-700">Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">What happens to my data if I cancel?</h4>
            <p className="text-amber-700">Your data is retained for 30 days after cancellation, giving you time to export or reactivate your account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
