
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bundleName, setBundleName] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      if (!bundleName) {
        setBundleName(selectedFile.name.replace('.csv', ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !bundleName.trim()) {
      toast.error("Please provide a file and bundle name");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("csv-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("csv-files")
        .getPublicUrl(fileName);

      // Parse CSV for basic info
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const columnsInfo = headers.map((header, index) => ({
        name: header,
        index,
        type: 'unknown'
      }));

      // Create bundle record
      const { data: bundleData, error: bundleError } = await supabase
        .from("bundles")
        .insert({
          user_id: user.id,
          name: bundleName.trim(),
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          columns_info: columnsInfo,
          summary_stats: {
            total_rows: lines.length - 1,
            total_columns: headers.length
          }
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      toast.success("Bundle created successfully!");
      navigate(`/bundle/${bundleData.id}`);
    } catch (error: any) {
      toast.error(error.message || "Error creating bundle");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Create New Bundle</h1>
          <p className="text-amber-600">Upload a CSV file to start analyzing your data</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Upload CSV File</CardTitle>
          <CardDescription>
            Select a CSV file and give your bundle a meaningful name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-2">
              Bundle Name
            </label>
            <Input
              placeholder="Enter bundle name"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 mb-2">
              CSV File
            </label>
            <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <FileText className="mx-auto h-12 w-12 text-amber-600" />
                  <p className="text-amber-800 font-medium">{file.name}</p>
                  <p className="text-amber-600 text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-amber-400" />
                  <p className="text-amber-600">
                    Click to select a CSV file or drag and drop
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !bundleName.trim() || uploading}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {uploading ? "Creating Bundle..." : "Create Bundle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
