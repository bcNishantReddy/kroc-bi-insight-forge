
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { validateBundleName } from "@/utils/validation";
import { validateCSVFile, validateCSVContent } from "@/utils/fileValidation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bundleName, setBundleName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [bundleNameError, setBundleNameError] = useState("");
  const [fileError, setFileError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError("");
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Basic file validation
    const basicValidation = validateCSVFile(selectedFile);
    if (!basicValidation.isValid) {
      setFileError(basicValidation.error || "Invalid file");
      return;
    }

    setValidating(true);
    
    // Content validation
    const contentValidation = await validateCSVContent(selectedFile);
    if (!contentValidation.isValid) {
      setFileError(contentValidation.error || "Invalid file content");
      setValidating(false);
      return;
    }

    setFile(selectedFile);
    setValidating(false);
    
    // Auto-generate bundle name if empty
    if (!bundleName) {
      const cleanName = selectedFile.name.replace('.csv', '').replace(/[^a-zA-Z0-9\s-_]/g, '');
      setBundleName(cleanName);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setBundleNameError("");
    setFileError("");

    // Validate bundle name
    const nameValidation = validateBundleName(bundleName);
    if (!nameValidation.isValid) {
      setBundleNameError(nameValidation.error || "Invalid bundle name");
      isValid = false;
    }

    // Validate file
    if (!file) {
      setFileError("Please select a CSV file");
      isValid = false;
    }

    return isValid;
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setUploading(true);
    try {
      // Generate secure filename
      const fileExtension = file!.name.split('.').pop() || 'csv';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${user.id}/${timestamp}_${randomId}.${fileExtension}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("csv-files")
        .upload(fileName, file!);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("csv-files")
        .getPublicUrl(fileName);

      // Parse CSV for basic info
      const csvText = await file!.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const columnsInfo = headers.map((header, index) => ({
        name: header,
        index,
        type: 'unknown'
      }));

      // Create bundle record with sanitized name
      const sanitizedBundleName = validateBundleName(bundleName);
      if (!sanitizedBundleName.isValid) {
        throw new Error("Invalid bundle name");
      }

      const { data: bundleData, error: bundleError } = await supabase
        .from("bundles")
        .insert({
          user_id: user.id,
          name: bundleName.trim(),
          file_name: file!.name,
          file_url: urlData.publicUrl,
          file_size: file!.size,
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
      console.error("Upload error:", error);
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
            Select a CSV file and give your bundle a meaningful name. Files are validated for security.
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
              onChange={(e) => {
                setBundleName(e.target.value);
                setBundleNameError("");
              }}
              className={bundleNameError ? "border-red-500" : ""}
            />
            {bundleNameError && (
              <p className="text-red-500 text-xs mt-1">{bundleNameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 mb-2">
              CSV File (Max 10MB)
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              fileError ? "border-red-300 bg-red-50" : "border-amber-300"
            }`}>
              {validating ? (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-amber-400 animate-pulse" />
                  <p className="text-amber-600">Validating file...</p>
                </div>
              ) : file ? (
                <div className="space-y-2">
                  <FileText className="mx-auto h-12 w-12 text-amber-600" />
                  <p className="text-amber-800 font-medium">{file.name}</p>
                  <p className="text-amber-600 text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex items-center text-green-600 text-sm">
                      <span className="mr-1">✓</span>
                      File validated
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setFileError("");
                    }}
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
                  <p className="text-xs text-amber-500">
                    CSV files only, max 10MB, up to 50,000 rows
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
            {fileError && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertTriangle className="mr-1 h-4 w-4" />
                {fileError}
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !!bundleNameError || !!fileError || uploading || validating}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {uploading ? "Creating Bundle..." : "Create Bundle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
