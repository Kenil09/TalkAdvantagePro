import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, FileText, Goal, Loader2, User, Users, X } from 'lucide-react'
import BasicContextPack from './BasicContextPack'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import PeopleContextPack from './PeopleContextPack'
import GoalsContextPack from './GoalsContextPack'
import DocumentsContextPack from './DocumentsContextPack'
import TimelineContextPack from './TimelineContextPack'
import { useAuthStore } from '@/lib/store/auth.store'
import useFormSubmit from '@/hooks/useFormSubmit'
import { useEffect } from 'react'
import { ContextPackForm } from '@/lib/weaviate-v3/collections/contextpack'
import * as contextPackService from '@/lib/weaviate-v3/collections/contextpack/contextpack.service'
import { useContextPackStore } from '@/lib/store/context-pack.store'

const formDefaultValues = {
  contextPackDetails: {
    name: '',
    duration: '',
    description: '',
  },
  name: '',
  userRole: '',
  nonUserName: '',
  clientName: '',
  preInteraction: {
    description: '',
    keyTopics: [],
    notes: '',
  },
  participants: [],
  goal: '',
  subGoals: [],
  documents: [],
  timeline: [],
  preInteractionNotes: '',
  contextFactors: '',
}

interface Props {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isEditContextPack: { status: boolean; uuid: string }
  setIsEditContextPack: (value: { status: boolean; uuid: string }) => void
}

const ContextPackModal = ({
  isOpen,
  setIsOpen,
  isEditContextPack,
  setIsEditContextPack,
}: Props) => {
  const user = useAuthStore((state) => state.user)
  const { fetchContextPacks } = useContextPackStore()
  const methods = useForm<ContextPackForm>({
    mode: 'onChange',
    defaultValues: formDefaultValues,
  })

  const { setValue } = methods

  useEffect(() => {
    const getData = async () => {
      const data = await contextPackService.getById(isEditContextPack.uuid)
      if (data) {
        Object.keys(formDefaultValues).forEach((key) => {
          setValue(
            key as keyof ContextPackForm,
            data.properties[key as keyof ContextPackForm],
          )
        })
      }
    }
    if (isEditContextPack.uuid) {
      getData()
    }
  }, [isEditContextPack.uuid, setValue])

  const createContextPack = async (data: ContextPackForm, userId: string) => {
    try {
      await contextPackService.create({ ...data, userId })
      // Fetch context packs again to update the list
      fetchContextPacks(userId)
    } catch (error) {
      alert(error)
    }
  }

  const updateContextPack = async (data: ContextPackForm, uuid: string) => {
    try {
      await contextPackService.update(uuid, data)
    } catch (error) {
      alert(error)
    }
  }

  const onSubmit = async (data: ContextPackForm) => {
    if (!user || !user.id) {
      alert('You must be logged in to create a context pack.')
      return
    }
    if (isEditContextPack.status) {
      await updateContextPack(data, isEditContextPack.uuid)
      setIsEditContextPack({ status: false, uuid: '' })
    } else {
      await createContextPack(data, user.id)
    }
  }

  const { handleSubmit, loading, error } = useFormSubmit<ContextPackForm>({
    onSubmit: (data) => onSubmit(data),
    onSuccess: () => setIsOpen(false),
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="!max-w-[800px] bg-white-50 p-0 max-h-[90vh] overflow-y-auto gap-0 [&>button]:hidden">
        {/* Header */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 ">
              <div className="flex items-start space-x-3 mb-2">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Create Context Pack
                  </DialogTitle>
                  <p className="text-blue-100 text-sm">
                    Organize people, documents, and objectives for meaningful
                    conversations
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {error && (
              <div className="px-6 py-2 text-red-500 text-sm">{error}</div>
            )}

            <div className="px-6 py-4">
              <Tabs defaultValue="account">
                <TabsList className="shadow-none bg-white gap-4">
                  <TabsTrigger
                    value="account"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <User className="size-5" /> Basic
                  </TabsTrigger>
                  <TabsTrigger
                    value="people"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <Users className="size-5" /> People
                  </TabsTrigger>
                  <TabsTrigger
                    value="goals"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <Goal className="size-5" /> Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer h-8"
                  >
                    <FileText className="size-5" /> Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer h-8"
                  >
                    <Clock className="size-5" /> Timeline
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <BasicContextPack />
                </TabsContent>
                <TabsContent value="people">
                  <PeopleContextPack />
                </TabsContent>
                <TabsContent value="goals">
                  <GoalsContextPack />
                </TabsContent>
                <TabsContent value="documents">
                  <DocumentsContextPack />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineContextPack />
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="sticky bottom-0 z-10">
              <div className="w-full border-t bg-white px-8 py-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {methods.watch('participants').length} participants •{' '}
                  {methods.watch('documents').length} documents •{' '}
                  {methods.watch('subGoals').filter(Boolean).length} objectives
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    className="h-11 text-base px-8 w-24 cursor-pointer"
                    onClick={() => {
                      setIsOpen(false)
                      setIsEditContextPack({
                        status: false,
                        uuid: '',
                      })
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base h-11 px-8 w-52 cursor-pointer"
                    disabled={loading}
                  >
                    {!loading ? (
                      <>
                        <FileText className="w-6 h-6" />
                        Save Context Pack
                      </>
                    ) : (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default ContextPackModal
