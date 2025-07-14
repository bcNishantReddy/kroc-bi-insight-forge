
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, BarChart3, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DataOverview from "@/components/bundle/DataOverview";
import DataVisualization from "@/components/bundle/DataVisualization";
import AIChat from "@/components/bundle/AIChat";

interface Bundle {
  id: string;
  name: string;
  file_name: string;
  file_url: string | null;
  file_size: number | null;
  columns_info: any;
  summary_stats: any;
  created_at: string;
}

export default function BundleView() {
  const { id } = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [csvData, setCsvData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBundle();
    }
  }, [id]);

  const fetchBundle = async () => {
    try {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setBundle(data);
      
      // Fetch CSV data
      if (data.file_url) {
        const response = await fetch(data.file_url);
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setCsvData(parsedData);
      }
    } catch (error) {
      toast.error("Error fetching bundle");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      return row;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-600">Loading bundle...</div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="text-center py-12">
        <p className="text-amber-600">Bundle not found</p>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-amber-800">{bundle.name}</h1>
          <p className="text-amber-600">File: {bundle.file_name}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Data Overview</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>AI Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DataOverview bundle={bundle} csvData={csvData} />
        </TabsContent>

        <TabsContent value="visualization">
          <DataVisualization bundle={bundle} csvData={csvData} />
        </TabsContent>

        <TabsContent value="chat">
          <AIChat bundle={bundle} csvData={csvData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
