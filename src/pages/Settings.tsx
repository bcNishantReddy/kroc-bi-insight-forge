
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Settings as SettingsIcon, Key, Brain } from "lucide-react";

export default function Settings() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [preferredModel, setPreferredModel] = useState("gemini");
  const [preferredOpenaiModel, setPreferredOpenaiModel] = useState("gpt-4o-mini");
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setOpenaiKey(data.openai_key || "");
        setPreferredModel(data.preferred_ai_model || "gemini");
        setPreferredOpenaiModel(data.preferred_openai_model || "gpt-4o-mini");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          openai_key: openaiKey,
          preferred_ai_model: preferredModel,
          preferred_openai_model: preferredOpenaiModel
        });

      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <SettingsIcon className="h-8 w-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Settings</h1>
          <p className="text-amber-600">Configure your AI preferences and API keys</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>
            Choose your preferred AI model for data analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-2">
              Preferred AI Model
            </label>
            <Select value={preferredModel} onValueChange={setPreferredModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini (Recommended)</SelectItem>
                <SelectItem value="openai">OpenAI GPT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preferredModel === "openai" && (
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                OpenAI Model
              </label>
              <Select value={preferredOpenaiModel} onValueChange={setPreferredOpenaiModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select OpenAI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {preferredModel === "openai" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <Key className="mr-2 h-5 w-5" />
              OpenAI API Configuration
            </CardTitle>
            <CardDescription>
              Enter your OpenAI API key to use GPT models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                OpenAI API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <p className="text-xs text-amber-600 mt-1">
                Your API key is stored securely and only used for your requests
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Account Information</CardTitle>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-amber-700">Email:</span>
              <span className="text-amber-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">User ID:</span>
              <span className="text-amber-900 font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
