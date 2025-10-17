"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, User } from "lucide-react";
import { toast } from "sonner";
import {
  removeStudentProfilePicture,
  updateStudent,
  updateStudentProfilePicture,
  Student,
} from "@/lib/students-services";

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"]).refine((val) => !!val, {
    message: "Gender is required",
  }),
  nationality: z.string().optional(),
  age: z.number().min(5, "Age must be at least 5.").max(100, "Age must be less than 100.").optional(),
  batch_id: z.string().min(1, {
    message: "Please select a batch.",
  }),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  batches?: Array<{ id: string; batch_code: string }>;
}

export function EditStudentDialog({
  open,
  onOpenChange,
  student,
  batches = [],
}: EditStudentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  console.log("EditStudentDialog student:", student);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: undefined,
      nationality: "",
      batch_id: "",
      notes: "",
      is_active: true,
    },
  });

  // Populate form when student data changes
  useEffect(() => {
    if (student && open) {
      form.reset({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        email: student.email || "",
        phone: student.phone || "",
        gender: student.gender as "male" | "female",
        nationality: student.nationality || "",
        age: student.age || undefined,
        batch_id: student.batch_id || "",
        notes: student.notes || "",
        is_active: student.is_active ?? true,
      });

      // Set current profile picture preview
      setPreviewUrl(student.profile_picture || null);
      setProfileImage(null); // Clear any selected file
      setShouldDeleteImage(false); // Add this
    }

    // Reset everything when dialog closes
    if (!open) {
      setProfileImage(null);
      setPreviewUrl(null);
      setError(null);
      setShouldDeleteImage(false); // Add this
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [student, open, form]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const removeImage = () => {
    setProfileImage(null);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // If there was an original image, mark it for deletion
    if (student?.profile_picture) {
      setShouldDeleteImage(true);
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Handle profile picture changes
      if (shouldDeleteImage) {
        await removeStudentProfilePicture(student.id);
      } else if (profileImage) {
        await updateStudentProfilePicture(student.id, profileImage);
      }

      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone || null,
        gender: values.gender,
        nationality: values.nationality || null,
        age: values.age !== undefined ? values.age : null,
        batch_id: values.batch_id,
        notes: values.notes || null,
        is_active: values.is_active,
      };

      await updateStudent(student.id, updateData);

      // Show success toast
      toast.success("Student updated successfully!", {
        description: `${values.first_name} ${values.last_name}'s information has been updated.`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error updating student:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while updating the student";
      setError(errorMessage);
      toast.error("Failed to update student", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Student
          </DialogTitle>
          <DialogDescription>
            Update student information and performance metrics.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Information</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={previewUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      {form.watch("first_name") && form.watch("last_name")
                        ? getInitials(
                            form.watch("first_name"),
                            form.watch("last_name")
                          )
                        : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Photo
                    </Button>

                    {(previewUrl || profileImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {profileImage ? "Remove Selected" : "Remove Photo"}
                      </Button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB
                </p>
              </div>
            </div>

            {/* Basic Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="18"
                          {...fieldProps}
                          value={value === undefined ? "" : value}
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., American, British, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.batch_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about the student..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">Student Summary</p>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {form.watch("first_name")} {form.watch("last_name")}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {form.watch("is_active") ? "Active" : "Inactive"}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {form.watch("email") || "Not provided"}
                </div>
                <div>
                  <span className="font-medium">Gender:</span>{" "}
                  {form.watch("gender")?.charAt(0).toUpperCase() +
                    form.watch("gender")?.slice(1)}
                </div>
                <div>
                  <span className="font-medium">Age:</span>{" "}
                  {form.watch("age") || "Not provided"}
                </div>
                <div>
                  <span className="font-medium">Nationality:</span>{" "}
                  {form.watch("nationality") || "Not provided"}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
