import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Briefcase,
    ChevronDown,
    Clock,
    FileText,
    Library,
    Plus,
    Users,
} from 'lucide-react'
import ContextPackSelectorModal from './ContextPackSelectorModal'
import { useContextPackStore } from '@/lib/store/context-pack.store'
import { useAuthStore } from '@/lib/store/auth.store'

const ContextPackSelect = ({
    setIsOpen,
    setIsEditContextPack,
}: {
    setIsOpen: (open: boolean) => void
    setIsEditContextPack: (open: { status: boolean; uuid: string }) => void
}) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const { currentContextPack, fetchContextPacks } = useContextPackStore()
    const user = useAuthStore((state) => state.user)
    
    // Fetch context packs when component mounts
    useEffect(() => {
        if (user && user.id) {
            fetchContextPacks(user.id)
        }
    }, [user, fetchContextPacks])

    const handleCreateNew = () => {
        setIsOpen(true)
    }

    const handleSelectFromLibrary = () => {
        setIsSelectorOpen(true)
    }

    const handleEditCurrent = () => {
        if (currentContextPack) {
            setIsOpen(true)
            setIsEditContextPack({
                status: true,
                uuid: currentContextPack.uuid,
            })
        }
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-t border-blue-200 px-4 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">
                                Context Pack
                            </span>
                            {currentContextPack ? (
                                <p className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-medium py-1  px-2 rounded-full">
                                    {currentContextPack?.properties?.contextPackDetails?.name}
                                </p>
                            ) : (
                                <p className="text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-1">
                                    None selected
                                </p>
                            )}
                        </div>
                        {currentContextPack && (
                            <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                                <div className="flex items-center space-x-1">
                                    <Users className="w-2.5 h-2.5" />
                                    <span>
                                        {currentContextPack?.properties
                                            .participants?.length + 1}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>
                                        {
                                            currentContextPack?.properties
                                                .documents?.length
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>
                                        {
                                            currentContextPack?.properties
                                                .timeline
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    {currentContextPack && (
                        <div className="flex items-center space-x-2 ml-4">
                            <div className="px-2 py-1 bg-white/70 backdrop-blur-sm border-0 shadow-sm rounded-md">
                                <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-blue-600" />
                                    <div className="text-xs text-gray-600">
                                        {currentContextPack?.properties.participants
                                            ?.slice(0, 2)
                                            .map((p) => p.name.split(' ')[0])
                                            .join(', ')}
                                        {currentContextPack?.properties
                                            .participants?.length > 2 &&
                                            ` +${
                                                (currentContextPack.properties
                                                    .participants?.length || 0) - 2
                                            }`}
                                    </div>
                                </div>
                            </div>

                            <div className="px-2 py-1 bg-white/70 backdrop-blur-sm border-0 shadow-sm rounded-md">
                                <div className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3 text-green-600" />
                                    <div className="text-xs text-gray-600">
                                        {
                                            currentContextPack?.properties
                                                .documents?.length
                                        }{' '}
                                        docs
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        size="sm"
                        onClick={handleSelectFromLibrary}
                        variant="outline"
                        className="h-7 px-3 text-xs border bg-transparent cursor-pointer"
                    >
                        <Library className="w-3 h-3" />
                        Select Pack
                        <ChevronDown className="w-3 h-3" />
                    </Button>

                    {currentContextPack && (
                        <Button
                            size="sm"
                            onClick={handleEditCurrent}
                            variant="outline"
                            className="h-7 px-3 text-xs border bg-transparent cursor-pointer"
                        >
                            <Briefcase className="w-3 h-3" />
                            Edit
                        </Button>
                    )}

                    <Button
                        size="sm"
                        onClick={handleCreateNew}
                        className="bg-primary-600 hover:bg-primary-500 text-white h-7 px-3 text-xs cursor-pointer"
                    >
                        <Plus className="w-3 h-3" />
                        New Pack
                    </Button>
                </div>
            </div>
            <ContextPackSelectorModal
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onCreateNew={() => {
                    setIsOpen(true)
                }}
            />
        </div>
    )
}

export default ContextPackSelect
