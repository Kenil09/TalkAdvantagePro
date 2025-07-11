"use client";

import { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  FileText,
  Clock,
  Target,
  Plus,
  Trash2,
  Briefcase,
  ChevronRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContextPackQueryResult } from "@/lib/weaviate-v3/collections/contextpack";
import * as contextPackService from "@/lib/weaviate-v3/collections/contextpack/contextpack.service";
import { useAuth } from "@/context/auth.context";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedContextPack: ContextPackQueryResult | null;
    setSelectedContextPack: Dispatch<SetStateAction<ContextPackQueryResult | null>>;
    onCreateNew: () => void;
}

export default function ContextPackSelectorModal({
  isOpen,
  onClose,
  selectedContextPack,
  setSelectedContextPack,
  onCreateNew,
}: Props) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [allContextPacks, setAllContextPacks] = useState<ContextPackQueryResult[]>([]);

  const fetchContextPacks = async (id: string) => {
    const packs = await contextPackService.get("userId", id);
    setAllContextPacks(packs);
  };

  useEffect(() => {
    if (user && user.id) {
      fetchContextPacks(user.id);
    }
  }, [user]);

  const handleSelectContextPack = (pack: ContextPackQueryResult) => {
    setSelectedContextPack(pack);
    onClose();
  };

  const handleDeleteContextPack = async (id: string) => {
    try {
      await contextPackService.deleteById(id);
      if (user && user.id) {
        fetchContextPacks(user.id);
      }
    } catch (error) {
      console.error("Error deleting context pack:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[800px] p-0 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white gap-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Select Context Pack
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                Choose from your existing context packs or create a new one
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        <div>
          {/* Search + Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search context packs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Button
                  type="button"
                  size="sm"
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Recent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sortBy === "name" ? "default" : "outline"}
                  onClick={() => setSortBy("name")}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Name
                </Button>
              </div>
              <Button
                type="button"
                onClick={onCreateNew}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-4 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Pack
              </Button>
            </div>
          </div>

          {/* Context Pack List */}
          <div className="p-6">
            {allContextPacks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery
                    ? "No matching context packs"
                    : "No context packs yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first context pack to get started"}
                </p>
                <Button
                  onClick={onCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  Create Context Pack
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allContextPacks.map((pack) => (
                  <div
                    key={pack.uuid}
                    className={`cursor-pointer transition-all duration-200 rounded-3xl hover:shadow-lg hover:scale-[1.02] border border-gray-200 shadow-sm ${
                      selectedContextPack?.uuid === pack.uuid
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedContextPack(pack);
                    }}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {pack.properties.name}
                          </h3>
                        </div>
                        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContextPack(pack.uuid);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                        </Button>
                        {selectedContextPack?.uuid === pack.uuid && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <Users className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              {pack.properties.participants?.length ?? 0}
                            </div>
                            <div className="text-xs text-gray-500">People</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                            <FileText className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              {pack.properties.documents?.length ?? 0}
                            </div>
                            <div className="text-xs text-gray-500">Docs</div>
                          </div>
                        </div>
                      </div>

                      {/* Goal */}
                      <div className="flex items-start space-x-2 mb-3">
                        <Target className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 line-clamp-2">
                          {pack.properties.goal || "No goal specified"}
                        </p>
                      </div>

                      {/* Timeline + Participants */}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-gray-600">
                          {pack.properties.timeline}
                        </span>
                        <div className="flex-1" />
                        <div className="flex -space-x-1">
                          {pack.properties.participants
                            ?.slice(0, 3)
                            .map((participant, idx) => (
                              <div
                                key={idx as Key}
                                className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white"
                                title={participant.name}
                              >
                                {participant.name.charAt(0) || "?"}
                              </div>
                            ))}
                          {pack.properties.participants.length > 3 && (
                            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white">
                              +{pack.properties.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 z-10 bg-white">
          <div className="w-full border-t px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedContextPack && (
                <span className="ml-2">
                  •{" "}
                  <span className="font-medium">
                    {selectedContextPack.properties.name}
                  </span>{" "}
                  selected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-11 text-base px-8 w-24 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  selectedContextPack &&
                  handleSelectContextPack(selectedContextPack)
                }
                disabled={!selectedContextPack}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer"
              >
                Use Selected Pack
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
