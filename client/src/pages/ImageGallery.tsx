import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Camera, 
  Download, 
  Calendar,
  MapPin,
  Info,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import { format } from "date-fns";
import type { EquipmentImage } from "@shared/schema";

interface ImageWithEquipment extends EquipmentImage {
  equipment_name?: string;
  equipment_location?: string;
}

export default function ImageGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "equipment" | "type">("date");

  // Fetch all images across all equipment types
  const { data: allImages, isLoading } = useQuery({
    queryKey: ["/api/images/all"],
    enabled: true
  });

  const images = (allImages as ImageWithEquipment[]) || [];

  // Filter and sort images
  const filteredImages = images
    .filter(image => {
      const matchesSearch = searchTerm === "" || 
        image.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.equipment_location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedEquipmentType === "all" || 
        image.equipment_type === selectedEquipmentType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "equipment":
          return (a.equipment_name || "").localeCompare(b.equipment_name || "");
        case "type":
          return a.equipment_type.localeCompare(b.equipment_type);
        default:
          return 0;
      }
    });

  const equipmentTypes = Array.from(new Set(images.map(img => img.equipment_type)));

  const downloadImage = (image: ImageWithEquipment) => {
    const link = document.createElement('a');
    link.href = image.image_url;
    link.download = image.image_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Gallery</h1>
        <p className="text-gray-600">
          Browse all equipment images across projects organized by date and time
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search images, equipment, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <select
              value={selectedEquipmentType}
              onChange={(e) => setSelectedEquipmentType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Equipment Types</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "equipment" | "type")}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="equipment">Sort by Equipment</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-600">
          <span>Total Images: {images.length}</span>
          <span>Filtered: {filteredImages.length}</span>
          <span>Equipment Types: {equipmentTypes.length}</span>
        </div>
      </div>

      {/* Image Grid/List */}
      {filteredImages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedEquipmentType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No images have been uploaded yet"
              }
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.image_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwQzEyNy42MTQgMTUwIDE1MCAxMjcuNjE0IDE1MCAxMDBDMTUwIDcyLjM4NTggMTI3LjYxNCA1MCAxMDAgNTBDNzIuMzg1OCA1MCA1MCA3Mi4zODU4IDUwIDEwMEM1MCAxMjcuNjE0IDcyLjM4NTggMTUwIDEwMCAxNTBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTAwIDEyMEMxMTEuMDQ2IDEyMCAxMjAgMTExLjA0NiAxMjAgMTAwQzEyMCA4OC45NTQzIDExMS4wNDYgODAgMTAwIDgwQzg4Ljk1NDMgODAgODAgODguOTU0MyA4MCAxMDBDODAgMTExLjA0NiA4OC45NTQzIDEyMCAxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
                
                {/* Overlay with metadata */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end p-4">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {image.equipment_type}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                        className="h-6 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium truncate">{image.equipment_name}</p>
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{image.equipment_location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(image.created_at || ""), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <Card key={image.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.image_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MC44MzY2IDQ4IDQ4IDQwLjgzNjYgNDggMzJDNDggMjMuMTYzNCA0MC44MzY2IDE2IDMyIDE2QzIzLjE2MzQgMTYgMTYgMjMuMTYzNCAxNiAzMkMxNiA0MC44MzY2IDIzLjE2MzQgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzIgNDBDMzYuNDE4MyA0MCA0MCAzNi40MTgzIDQwIDMyQzQwIDI3LjU4MTcgMzYuNDE4MyAyNCAzMiAyNEMyNy41ODE3IDI0IDI0IDI3LjU4MTcgMjQgMzJDMjQgMzYuNDE4MyAyNy41ODE3IDQwIDMyIDQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{image.image_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {image.equipment_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{image.equipment_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{image.equipment_location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(image.created_at || ""), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(image)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}