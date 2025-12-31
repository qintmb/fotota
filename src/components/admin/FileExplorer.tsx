import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Folder, File, Download, Trash2, Eye, Upload, Grid, List, FolderPlus } from "./icons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  url?: string;
  thumbnailUrl?: string;
}

export function FileExplorer() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles("");
  }, []);

  useEffect(() => {
    const loadUrls = async () => {
      const urls: Record<string, string> = {};
      for (const file of files.filter(f => f.type === 'file')) {
        const url = await getSignedUrl(file.path);
        if (url) {
          urls[file.path] = url;
        }
      }
      setFileUrls(urls);
    };
    if (files.length > 0) {
      loadUrls();
    }
  }, [files]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('FOTO')
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      const fileItems: FileItem[] = [];
      const folders = new Set<string>();

      if (data) {
        data.forEach(item => {
          const fullPath = path ? `${path}/${item.name}` : item.name;

          // Check if this is a file in a subfolder
          if (item.name.includes('/')) {
            // This is a file in a subfolder, extract the folder name
            const folderName = item.name.split('/')[0];
            folders.add(folderName);
          } else {
            // This is a file or folder in current directory
            // In Supabase, folders don't exist as objects, but if name has no extension, treat as folder
            const isFolder = !item.name.includes('.');
            if (isFolder) {
              folders.add(item.name);
            } else {
              // It's a file
              fileItems.push({
                name: item.name,
                path: fullPath,
                type: 'file',
                size: item.metadata?.size,
                lastModified: item.updated_at
              });
            }
          }
        });

        // Add folders
        folders.forEach(folderName => {
          fileItems.push({
            name: folderName,
            path: path ? `${path}/${folderName}` : folderName,
            type: 'folder'
          });
        });
      }

      setFiles(fileItems);
      setCurrentPath(path);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Gagal Memuat File",
        description: "Terjadi kesalahan saat memuat file dari storage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    loadFiles(newPath);
  };

  const navigateUp = () => {
    if (currentPath) {
      const pathParts = currentPath.split('/');
      pathParts.pop();
      const newPath = pathParts.join('/');
      loadFiles(newPath);
    }
  };

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('FOTO')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast({
        title: "Gagal Mendapatkan URL",
        description: "Terjadi kesalahan saat mendapatkan URL file",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadFiles = async (filesToUpload: FileList) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    const allowedExtensions = ['.jpg', '.png'];
    for (const file of Array.from(filesToUpload)) {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(ext)) {
        toast({
          title: "File Tidak Didukung",
          description: `File ${file.name} harus berupa .jpg atau .png`,
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(filesToUpload).map(async (file) => {
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        const { data, error } = await supabase
          .storage
          .from('FOTO')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        return data;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Upload Berhasil",
        description: `${filesToUpload.length} file berhasil diupload`,
      });

      // Refresh current directory
      loadFiles(currentPath);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Gagal Upload",
        description: "Terjadi kesalahan saat upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Nama Folder Kosong",
        description: "Masukkan nama folder yang valid",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}/.keep` : `${newFolderName}/.keep`;
      const { data, error } = await supabase
        .storage
        .from('FOTO')
        .upload(folderPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Folder Berhasil Dibuat",
        description: `Folder "${newFolderName}" berhasil dibuat`,
      });

      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
      // Refresh current directory
      loadFiles(currentPath);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Gagal Membuat Folder",
        description: "Terjadi kesalahan saat membuat folder",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const url = await getSignedUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deleteFiles = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('FOTO')
        .remove(selectedFiles);

      if (error) {
        throw error;
      }

      toast({
        title: "File Berhasil Dihapus",
        description: `${selectedFiles.length} file berhasil dihapus`,
      });

      // Refresh current directory
      loadFiles(currentPath);
    } catch (error) {
      console.error('Error deleting files:', error);
      toast({
        title: "Gagal Menghapus File",
        description: "Terjadi kesalahan saat menghapus file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari file atau folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Lokasi: {currentPath || 'Root'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </span>
            </Button>
            <input
              type="file"
              multiple
              accept=".jpg,.png"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Folder Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nama folder"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setNewFolderName(""); setIsNewFolderDialogOpen(false); }}>Batal</Button>
                <Button onClick={createFolder} disabled={isCreatingFolder}>
                  {isCreatingFolder ? 'Membuat...' : 'Buat'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {currentPath && (
            <Button variant="outline" size="sm" onClick={navigateUp}>
              ⬆️ Kembali
            </Button>
          )}
          {selectedFiles.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteFiles}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* File Display */}
      {viewMode === 'list' ? (
        <div className="bg-background border border-border/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(filteredFiles.map(f => f.path));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                      className="mr-2"
                    />
                    Nama
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tipe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Ukuran</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Terakhir Diubah</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        Memuat file...
                      </div>
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? 'Tidak ada file yang cocok dengan pencarian Anda' : 'Folder ini kosong'}
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr
                      key={file.path}
                      className={`border-t border-border/50 hover:bg-muted/50 ${
                        selectedFiles.includes(file.path) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.path)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles([...selectedFiles, file.path]);
                              } else {
                                setSelectedFiles(selectedFiles.filter(p => p !== file.path));
                              }
                            }}
                            className="mr-2"
                          />
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => file.type === 'folder' && navigateToFolder(file.name)}
                          >
                            {file.type === 'folder' ? (
                              <Folder className="h-5 w-5 text-amber-500" />
                            ) : (
                              <File className="h-5 w-5 text-blue-500" />
                            )}
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {file.type === 'folder' ? 'Folder' : 'File'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {file.type === 'file' ? formatFileSize(file.size) : '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {file.lastModified ? formatDateTime(file.lastModified) : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {file.type === 'file' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const url = await getSignedUrl(file.path);
                                  if (url) {
                                    window.open(url, '_blank');
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(file.path, file.name)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background border border-border/50 rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <div className="w-4 h-4 border-4 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Memuat file...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {searchTerm ? 'Tidak ada file yang cocok dengan pencarian Anda' : 'Folder ini kosong'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className={`relative group border border-border/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                    selectedFiles.includes(file.path) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.path)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.path]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(p => p !== file.path));
                      }
                    }}
                    className="absolute top-2 left-2 z-10"
                  />
                  {file.type === 'folder' ? (
                    <div
                      className="aspect-square flex items-center justify-center bg-muted/50 cursor-pointer"
                      onClick={() => navigateToFolder(file.name)}
                    >
                      <Folder className="h-12 w-12 text-amber-500" />
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="aspect-square cursor-pointer">
                          <img
                            src={fileUrls[file.path] || ''}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img
                          src={fileUrls[file.path] || ''}
                          alt={file.name}
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-medium">{file.name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(file.path, file.name)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <div className="p-2 bg-background/80">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    {file.type === 'file' && file.size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}