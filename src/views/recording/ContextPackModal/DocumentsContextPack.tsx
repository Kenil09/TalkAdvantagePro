import FormInput from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth.context'
import { ContextPackForm } from '@/lib/weaviate-v3/collections/contextpack'
import { documentProcessorService } from '@/lib/weaviate/document-service'
import { CheckCircle, FileText, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

const DocumentsContextPack = () => {
  const { user } = useAuth()

  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const { control, register, setValue, watch, getValues } =
    useFormContext<ContextPackForm>()
  const { fields } = useFieldArray({
    control,
    name: 'documents',
    keyName: 'name',
  })

  const addDocument = () => {
    const newDoc = {
      name: '',
      file: '',
      type: 'pdf',
      tags: [],
    }
    const currentDocuments = getValues('documents')
    if (!currentDocuments) return
    setValue('documents', [...currentDocuments, newDoc])
    return newDoc
  }

  const removeDocument = (id: string) => {
    const currentDocuments = getValues('documents')
    if (!currentDocuments) return

    setValue(
      'documents',
      currentDocuments.filter((doc) => {
        const docId = doc.name.toString()
        const fieldId = id.toString()
        return docId !== fieldId
      }),
    )
  }

  const documents = watch('documents')

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    if (!user) {
      alert('You must be logged in to upload files.')
      return
    }

    const document = documents[index]

    if (!document.name) {
      alert('Please enter a document name before uploading.')
      return
    }
    setUploading(true)
    setUploadSuccess(false)
    try {
      // Process and store document chunks
      const chunks = await documentProcessorService.processDocument(file, {
        name: document.name,
        tags: document.tags.map((tag) => tag.trim()),
      })

      // Store chunks in Weaviate
      await documentProcessorService.storeDocumentChunks(user.id, chunks)

      // Store document reference in context pack
      setValue(`documents.${index}.file`, file.name)
      setUploadSuccess(true)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Reference Documents
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Add documents that provide context for this conversation
          </p>
        </div>
        <Button
          onClick={addDocument}
          type="button"
          className="bg-primary-600 hover:bg-primary-500 px-6 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </Button>
      </div>
      <div className="py-6 overflow-y-auto  pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded">
        {fields.map((field, index) => {
          return (
            <div
              key={field.name}
              className="p-6 shadow-sm bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:shadow-md transition-shadow mb-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Document {index + 1}
                    </h4>
                    <p className="text-sm text-gray-500">Reference material</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(field.name)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end-safe">
                <div>
                  <FormInput
                    label="Document Name"
                    type="text"
                    {...register(`documents.${index}.name`)}
                    placeholder="Q4_Product_Roadmap.pdf"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <FormInput
                    label="Tags (comma separated)"
                    {...register(`documents.${index}.tags`)}
                    type="text"
                    placeholder="Tag1, Tag2, Tag3"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {!field.file && !uploadSuccess ? (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                      disabled={uploading}
                      onClick={() =>
                        document
                          .getElementById(`document-upload-${index}`)
                          ?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        id={`document-upload-${index}`}
                        type="file"
                        disabled={uploading}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => handleFileUpload(e, index)}
                      />
                    </Button>
                  </div>
                ) : (
                  <CheckCircle className="h-5 w-5 mb-2.5 text-green-500" />
                )}
              </div>
            </div>
          )
        })}

        {fields.length === 0 && (
          <div className="p-12 border-2 border-dashed border-gray-200 bg-gray-50/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents added
              </h3>
              <p className="text-gray-500 mb-4">
                Add reference documents to provide context
              </p>
              <Button
                onClick={() => addDocument()}
                variant="outline"
                type="button"
                className="px-6 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add First Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentsContextPack
