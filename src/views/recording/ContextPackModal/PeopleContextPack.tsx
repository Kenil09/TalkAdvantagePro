import FormInput from "@/components/formInput";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormValues } from "@/types/contextPack";

interface PeopleContextPackProps {
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
}

const PeopleContextPack: React.FC<PeopleContextPackProps> = ({
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const { register, control } = useFormContext<FormValues>();

  const { fields } = useFieldArray({
    control,
    name: "participants",
    keyName: "fieldId",
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Meeting Participants
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Add people who will be part of this conversation
          </p>
        </div>
        <Button
          className="bg-primary-600 hover:bg-primary-500 px-6 cursor-pointer"
          onClick={() => onAddParticipant()}
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </Button>
      </div>
      <div className="py-4 overflow-y-auto pr-2 ">
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 border border-gray-200 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow mb-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Participant {index + 1}
                    </h4>
                    <p className="text-sm text-gray-500">Meeting attendee</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  onClick={() => onRemoveParticipant(field.id)}
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormInput
                    label="Full Name"
                    {...register(`participants.${index}.name`)}
                    placeholder="Sarah Johnson"
                    type="text"
                  />
                </div>
                <div>
                  <FormInput
                    label="Role/Title"
                    {...register(`participants.${index}.role`)}
                    placeholder="Engineering Lead"
                    type="text"
                  />
                </div>
                <div>
                  <FormInput
                    label="Relationship"
                    {...register(`participants.${index}.relationship`)}
                    placeholder="Colleague, Manager, etc."
                    type="text"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center h-full">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No participants yet
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              Add people who will be part of this conversation
            </p>
            <Button
              variant="outline"
              className="h-11 px-6 cursor-pointer"
              onClick={() => onAddParticipant()}
              type="button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Participant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleContextPack;
