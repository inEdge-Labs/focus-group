"use client";

import { useState, memo } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Persona, CreateSessionRequest } from "@/server/types";
import { createSession } from "@/server/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

// Schema definitions
const personaSchema = z.object({
  Name: z.string().min(2, "Name is required"),
  Age: z.number().min(1, "Age is required"),
  Occupation: z.string().min(2, "Occupation is required"),
  Traits: z.array(z.string()).min(1, "At least one trait is required"),
  Background: z.string().min(5, "Background is required"),
  Interests: z.array(z.string()).min(1, "At least one interest is required"),
  Concerns: z.array(z.string()).min(1, "At least one concern is required"),
  SpeakingStyle: z.string().min(5, "Speaking style is required"),
});

const formSchema = z.object({
  product_idea: z.string().min(5, "Product idea must be at least 5 characters"),
  theme: z.string().min(3, "Theme must be at least 3 characters"),
  personas: z.array(personaSchema).min(1, "At least one persona is required"),
});

type FormValues = z.infer<typeof formSchema>;

// Helper type guard for type safety with array fields

// Array field component (for Traits, Interests, Concerns)
interface ArrayFieldProps {
  form: UseFormReturn<FormValues>;
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

// PersonaFormSection component with performance improvements
interface PersonaFormSectionProps {
  form: UseFormReturn<FormValues>;
}

function PersonaFormSection({ form }: PersonaFormSectionProps) {
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
                            ? 0
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

          {/* Reusable array fields */}
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

// Main form component
interface CreateSessionFormProps {
  onSuccess: (sessionId: string) => void;
}

export function CreateSessionForm({ onSuccess }: CreateSessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPersona: Persona = {
    Name: "",
    Age: 30,
    Occupation: "",
    Traits: [""],
    Background: "",
    Interests: [""],
    Concerns: [""],
    SpeakingStyle: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_idea: "",
      theme: "",
      personas: [defaultPersona],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const sessionData: CreateSessionRequest = {
        product_idea: data.product_idea,
        theme: data.theme,
        personas: data.personas,
      };

      const session = await createSession(sessionData);
      toast.success("Focus group created successfully");
      onSuccess(session.id);
    } catch (error) {
      toast.error(`Failed to create focus group`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="product_idea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Idea</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Smart Home Assistant" {...field} />
                </FormControl>
                <FormDescription>
                  The product or service you want feedback on
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. User Experience" {...field} />
                </FormControl>
                <FormDescription>
                  The main focus of this discussion
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <PersonaFormSection form={form} />

        <DialogFooter>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Focus Group"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
