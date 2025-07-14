
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Upload, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Bundle {
  id: string;
  name: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<Bundle | null>(null);
  const [editDialog, setEditDialog] = useState<Bundle | null>(null);
  const [newName, setNewName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setBundles(data || []);
    } catch (error) {
      toast.error("Error fetching bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bundle: Bundle) => {
    try {
      const { error } = await supabase
        .from("bundles")
        .delete()
        .eq("id", bundle.id);

      if (error) throw error;
      
      setBundles(bundles.filter(b => b.id !== bundle.id));
      toast.success("Bundle deleted successfully");
      setDeleteDialog(null);
    } catch (error) {
      toast.error("Error deleting bundle");
    }
  };

  const handleRename = async () => {
    if (!editDialog || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from("bundles")
        .update({ name: newName.trim() })
        .eq("id", editDialog.id);

      if (error) throw error;
      
      setBundles(bundles.map(b => 
        b.id === editDialog.id ? { ...b, name: newName.trim() } : b
      ));
      toast.success("Bundle renamed successfully");
      setEditDialog(null);
      setNewName("");
    } catch (error) {
      toast.error("Error renaming bundle");
    }
  };

  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-600">Loading bundles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Dashboard</h1>
          <p className="text-amber-600">Manage your data bundles</p>
        </div>
        <Button onClick={() => navigate("/upload")} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          New Bundle
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4" />
          <Input
            placeholder="Search bundles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredBundles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Upload className="mx-auto h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              {bundles.length === 0 ? "No bundles yet" : "No matching bundles"}
            </h3>
            <p className="text-amber-600 mb-4">
              {bundles.length === 0 
                ? "Upload your first CSV file to get started with data analysis"
                : "Try adjusting your search terms"
              }
            </p>
            {bundles.length === 0 && (
              <Button onClick={() => navigate("/upload")} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bundle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBundles.map((bundle) => (
            <Card key={bundle.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-amber-800 truncate">
                    {bundle.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        setEditDialog(bundle);
                        setNewName(bundle.name);
                      }}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog(bundle)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  File: {bundle.file_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-amber-600">
                  <div>Size: {formatFileSize(bundle.file_size)}</div>
                  <div>Created: {new Date(bundle.created_at).toLocaleDateString()}</div>
                </div>
                <Button 
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={() => navigate(`/bundle/${bundle.id}`)}
                >
                  Open Bundle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bundle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Bundle</DialogTitle>
            <DialogDescription>
              Enter a new name for your bundle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Bundle name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
