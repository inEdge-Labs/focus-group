"use client";

import { useFieldArray, type UseFormReturn, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { memo } from "react";

// Strong typing for form schema
export interface Persona {
  Name: string;
  Age: number;
  Occupation: string;
  Traits: string[];
  Background: string;
  Interests: string[];
  Concerns: string[];
  SpeakingStyle: string;
}

// This interface should align with the Zod schema
export interface FormSchema {
  personas: Persona[];
}

interface PersonaFormSectionProps {
  form: UseFormReturn<FormSchema>;
}

// Helper component for array fields (Traits, Interests, Concerns)
interface ArrayFieldProps {
  form: UseFormReturn<FormSchema>;
  personaIndex: number;
  fieldName: "Traits" | "Interests" | "Concerns";
  label: string;
  placeholder: string;
}

const ArrayField = memo(
  ({ form, personaIndex, fieldName, label, placeholder }: ArrayFieldProps) => {
    // Get the current array values
    const arrayValues = form.watch(`personas.${personaIndex}.${fieldName}`);

    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        {arrayValues.map((_, itemIndex) => (
          <div
            key={`${fieldName}-${personaIndex}-${itemIndex}`}
            className="flex gap-2"
          >
            <FormField
              control={form.control}
              name={`personas.${personaIndex}.${fieldName}.${itemIndex}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                if (arrayValues.length > 1) {
                  const newValues = [...arrayValues];
                  newValues.splice(itemIndex, 1);
                  form.setValue(
                    `personas.${personaIndex}.${fieldName}`,
                    newValues,
                  );
                }
              }}
              disabled={arrayValues.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const currentValues = [...arrayValues];
            currentValues.push("");
            form.setValue(
              `personas.${personaIndex}.${fieldName}`,
              currentValues,
            );
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {label.slice(0, -1)} {/* Remove 's' from plural label */}
        </Button>
      </div>
    );
  },
);

ArrayField.displayName = "ArrayField";

// Main component with performance optimizations
export function PersonaFormSection({ form }: PersonaFormSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "personas",
  });

  const addPersona = () => {
    const newPersona: Persona = {
      Name: "",
      Age: 30,
      Occupation: "",
      Traits: [""],
      Background: "",
      Interests: [""],
      Concerns: [""],
      SpeakingStyle: "",
    };
    append(newPersona);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Personas</h3>
        <Button type="button" variant="outline" size="sm" onClick={addPersona}>
          <Plus className="mr-2 h-4 w-4" />
          Add Persona
        </Button>
      </div>

      {fields.map((field, personaIndex) => (
        <div key={field.id} className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Persona {personaIndex + 1}</h4>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(personaIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`personas.${personaIndex}.Name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name={`personas.${personaIndex}.Age`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 35"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`personas.${personaIndex}.Occupation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`personas.${personaIndex}.SpeakingStyle`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speaking Style</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Technical, direct" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`personas.${personaIndex}.Background`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief background of this persona"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Using the reusable ArrayField component for repetitive fields */}
          <ArrayField
            form={form}
            personaIndex={personaIndex}
            fieldName="Traits"
            label="Traits"
            placeholder="e.g. Analytical"
          />

          <ArrayField
            form={form}
            personaIndex={personaIndex}
            fieldName="Interests"
            label="Interests"
            placeholder="e.g. Technology"
          />

          <ArrayField
            form={form}
            personaIndex={personaIndex}
            fieldName="Concerns"
            label="Concerns"
            placeholder="e.g. Privacy"
          />
        </div>
      ))}
    </div>
  );
}
