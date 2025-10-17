"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef } from "react";
import { createTeacher } from "@/lib/teachers-services";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  age: z.number().min(18, "Age must be at least 18.").max(100, "Age must be less than 100.").optional(),
  department: z.string().min(1, { message: "Department is required." }),
  position: z.string().min(1, { message: "Position is required." }),
  hire_date: z.date({ message: "Please select a hire date." }),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"], {
    message: "Please select a status.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeacherDialogProps {
  onTeacherAdded?: () => void;
}

export function AddTeacherDialog({ onTeacherAdded }: AddTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedTeacherId, setGeneratedTeacherId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      nationality: "",
      department: "",
      position: "",
      notes: "",
      status: "active",
    },
  });

  // Generate teacher ID when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen && !generatedTeacherId) {
      setIsGeneratingId(true);
      try {
        // Generate a unique teacher ID similar to student ID
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-4);
        const newId = `TCH-${year}-${timestamp}`;
        setGeneratedTeacherId(newId);
      } catch (error) {
        console.error("Failed to generate teacher ID:", error);
        setError("Failed to generate teacher ID. Please try again.");
      } finally {
        setIsGeneratingId(false);
      }
    }

    if (!isOpen) {
      // Reset everything when dialog closes
      form.reset();
      setProfileImage(null);
      setPreviewUrl(null);
      setGeneratedTeacherId("");
      setError(null);
      setIsGeneratingId(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Please select a valid image file (JPG, PNG, WebP)";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate file size (max 2MB to match bucket)
      if (file.size > 2 * 1024 * 1024) {
        const errorMsg = `Image must be less than 2MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
      toast.success("Image uploaded successfully!");
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Upload profile image to Supabase storage if exists
      let profilePictureUrl = "";
      if (profileImage) {
        try {
          const fileExt = profileImage.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          console.log("Uploading image to teacher-profile bucket:", fileName);
          
          // Try to upload image directly
          console.log("Attempting to upload image...");
          const { error: uploadError } = await supabase.storage
            .from('teacher-profile')
            .upload(fileName, profileImage, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error("Image upload error:", uploadError);
            
            // Check if it's a bucket not found error
            if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
              toast.warning("Image upload skipped - storage bucket not configured. Teacher will be created without image.");
            } else {
              toast.warning(`Image upload failed: ${uploadError.message}. Teacher will be created without image.`);
            }
            // Continue without image instead of failing
          } else {
            // Get the public URL for the uploaded image
            const { data: { publicUrl } } = supabase.storage
              .from('teacher-profile')
              .getPublicUrl(fileName);
            
            profilePictureUrl = publicUrl;
            console.log("Image uploaded successfully:", profilePictureUrl);
            toast.success("Image uploaded successfully!");
          }
        } catch (imageError) {
          console.error("Image upload process failed:", imageError);
          toast.warning("Image upload failed. Teacher will be created without image.");
          // Continue without image
        }
      }

      // Prepare teacher data
      const teacherData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        nationality: values.nationality || undefined,
        age: values.age,
        department: values.department,
        position: values.position,
        hire_date: values.hire_date.toISOString().split('T')[0], // Format date for database
        notes: values.notes || undefined,
        profile_picture: profilePictureUrl || undefined,
        status: values.status,
      };

      console.log("Sending teacher data:", teacherData);
      
      // Test database connection first
      console.log("Testing database connection...");
      const { data: testData, error: testError } = await supabase
        .from("teachers")
        .select("count", { count: "exact", head: true });
      
      if (testError) {
        console.error("Database connection test failed:", testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log("Database connection successful, teacher count:", testData);
      
      const result = await createTeacher(teacherData);
      console.log("Teacher created successfully:", result);
      toast.success("Teacher added successfully!");
      
      // Reset form and close dialog on success
      form.reset();
      setOpen(false);
      
      if (onTeacherAdded) {
        onTeacherAdded();
      }
      router.refresh();
    } catch (err: unknown) {
      console.error("Error adding teacher:", err);
      
      // Log the full error object for debugging
      console.error("Full error object:", JSON.stringify(err, null, 2));

      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(err.message);
        toast.error(`Failed to add teacher: ${err.message}`);
      } else if (typeof err === 'object' && err !== null) {
        // Handle Supabase error objects
        const supabaseError = err as { code?: string; message?: string; details?: string };
        let errorMessage = "An error occurred while adding the teacher";
        
        if (supabaseError.code === '23505') {
          // Unique constraint violation
          if (supabaseError.details?.includes('email')) {
            errorMessage = "A teacher with this email address already exists. Please use a different email.";
          } else if (supabaseError.details?.includes('teacher_id')) {
            errorMessage = "Teacher ID conflict. Please try again.";
          } else {
            errorMessage = "This information already exists in the system. Please check your entries.";
          }
        } else if (supabaseError.message) {
          errorMessage = supabaseError.message;
        }
        
        console.error("Supabase error:", supabaseError);
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        console.error("Unknown error type:", typeof err);
        setError("An error occurred while adding the teacher");
        toast.error("An error occurred while adding the teacher");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter the teacher&apos;s information below. Teacher ID will be generated automatically.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Generated Teacher ID Display */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm font-medium text-gray-700">
                Teacher ID (Auto-generated)
              </label>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {isGeneratingId
                  ? "Generating..."
                  : generatedTeacherId || "Loading..."}
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={previewUrl || undefined} />
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
                    Upload Photo
                  </Button>

                  {previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
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

              {/* Show error message specifically for image upload */}
              {error && (error.includes("image") || error.includes("2MB") || error.includes("file")) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, WebP. Max size: 2MB
              </p>
            </div>
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
                name="age"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Teacher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Hire Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick hire date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the teacher..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
