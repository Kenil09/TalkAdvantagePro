import FormInput from "@/components/formInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormValues } from "@/types/contextPack";
import { documentTypes } from "@/utils/contextData";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

const DocumentsContextPack = ({
  addDocument,
  removeDocument,
}: {
  addDocument: () => void;
  removeDocument: (id: string) => void;
}) => {
  const { control, register, setValue } = useFormContext<FormValues>();
  const { fields } = useFieldArray({
    control,
    name: "documents",
    keyName: "fieldId",
  });

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
          className="bg-blue-600 hover:bg-blue-700 h-11 px-6 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </Button>
      </div>
      <div className="py-6 overflow-y-auto  pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded">
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
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
                  onClick={() => removeDocument(field.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Document Type
                  </Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => {
                      setValue(`documents.${index}.type`, value);
                    }}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((docType) => (
                        <SelectItem key={docType.value} value={docType.value}>
                          {docType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
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
  );
};

export default DocumentsContextPack;
